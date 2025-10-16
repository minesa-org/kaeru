import { TextChannel, ThreadChannel, MessageFlags, SlashCommandBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, } from "discord.js";
import { karu } from "../../config/karu.js";
import { containerTemplate, getEmoji, sendAlertMessage } from "../../utils/export.js";
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
        const messages = await channel.messages.fetch({ limit: 100 });
        const messageTexts = messages
            .map(m => m.content)
            .filter(Boolean)
            .join("\n");
        const systemPrompt = `You are Kaeru, an AI that analyzes the overall mood of a Discord channel.
Do NOT break it down by individual users.
Focus on the collective mood based on the messages provided.
Provide a concise summary in percentages, like:
Happy: 70%
Sad: 30%
Neutral: 0%
Only give the percentages and mood labels, no extra text.
Use the messages below as input:
${messageTexts}
`.trim();
        const model = karu.getGenerativeModel({
            model: "gemma-3n-e4b-it",
            generationConfig: {
                temperature: 0.2,
                maxOutputTokens: 300,
                topK: 1,
                topP: 1,
            },
        });
        const result = await model.generateContent(systemPrompt);
        const output = result.response.text().trim();
        const moodValues = {};
        output.split("\n").forEach((line) => {
            const [mood, value] = line.split(":").map((s) => s.trim());
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
