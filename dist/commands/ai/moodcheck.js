import { TextChannel, ThreadChannel, MessageFlags, SlashCommandBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, } from "discord.js";
import { containerTemplate, getEmoji, sendAlertMessage } from "../../utils/export.js";
import { karus } from "../../config/karu.js";
const moodCheck = {
    data: new SlashCommandBuilder()
        .setName("mood-check")
        .setDescription("See channel's mood breakdown")
        .setNameLocalizations({
        tr: "ruh-hali",
        ru: "настроение-канала",
        de: "stimmungs-check",
        it: "umore-canale",
        "zh-CN": "心情-检查",
        "pt-BR": "ver-humor",
    })
        .setDescriptionLocalizations({
        tr: "Kanalın ruh halini gör",
        ru: "Посмотреть настроение канала",
        de: "Stimmungsübersicht des Kanals anzeigen",
        it: "Visualizza l'umore del canale",
        "zh-CN": "查看频道的心情",
        "pt-BR": "Ver o humor do canal",
    }),
    execute: async (interaction) => {
        const { channel } = interaction;
        if (!channel) {
            return sendAlertMessage({
                interaction,
                content: `${getEmoji("reactions.kaeru.question")} No message exists in here, I can feel it...`,
                type: "error",
                tag: "Message",
            });
        }
        if (!(channel instanceof TextChannel || channel instanceof ThreadChannel)) {
            return sendAlertMessage({
                interaction,
                content: "If it is not a text channel... then I cannot, sorry.",
                tag: "Channel Type",
            });
        }
        await interaction.deferReply();
        const messages = await channel.messages.fetch({ limit: 30 });
        const messageTexts = messages
            .map(m => m.content)
            .filter(Boolean)
            .join("\n");
        const systemPrompt = `
You are Kāru, an AI that analyzes the collective emotional mood of a Discord channel based only on the messages provided.

Instructions:
- DO NOT break it down by individual users.
- Focus solely on the overall mood of the group.
- Output only three lines, each with a mood label and percentage.
- The labels must be: Happy, Neutral, Sad.
- Total must sum to ~100%.

Example output:
Happy: 65%
Neutral: 20%
Sad: 15%

Messages to analyze:
${messageTexts}
`.trim();
        const completion = await karus.chat.completions.create({
            model: "deepseek/deepseek-chat-v3.1:free",
            temperature: 0.3,
            top_p: 1,
            messages: [{ role: "user", content: systemPrompt }],
        });
        const output = completion.choices[0]?.message?.content?.trim() || "";
        const moodValues = {};
        output.split("\n").forEach(line => {
            const [mood, value] = line.split(":").map(s => s.trim());
            if (mood && value)
                moodValues[mood] = value;
        });
        const moodButtons = new ActionRowBuilder().addComponents(new ButtonBuilder()
            .setCustomId("1")
            .setDisabled(true)
            .setEmoji("😊")
            .setLabel(`${moodValues.Happy || "0%"}`)
            .setStyle(ButtonStyle.Secondary), new ButtonBuilder()
            .setCustomId("2")
            .setDisabled(true)
            .setEmoji("😐")
            .setLabel(`${moodValues.Neutral || "0%"}`)
            .setStyle(ButtonStyle.Secondary), new ButtonBuilder()
            .setCustomId("3")
            .setDisabled(true)
            .setEmoji("😢")
            .setLabel(`${moodValues.Sad || "0%"}`)
            .setStyle(ButtonStyle.Secondary));
        await interaction.editReply({
            components: [
                containerTemplate({
                    tag: `${getEmoji("magic")} Kāru Moodcheck AI`,
                    description: ["### Moods", "- 😊: Happy", "- 😐: Neutral", "- 😢: Sad"],
                }),
                moodButtons,
            ],
            flags: MessageFlags.IsComponentsV2,
        });
        messages.clear();
    },
};
export default moodCheck;
