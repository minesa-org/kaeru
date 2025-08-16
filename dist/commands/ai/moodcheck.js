import { TextChannel, ThreadChannel, MessageFlags, SlashCommandBuilder, ContainerBuilder, TextDisplayBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, SeparatorBuilder, } from "discord.js";
import { karu } from "../../config/karu.js";
import { getEmoji, sendErrorMessage } from "../../utils/export.js";
export default {
    data: new SlashCommandBuilder()
        .setName("moodcheck")
        .setDescription("See channel's mood breakdown")
        .setNameLocalizations({
        tr: "ruhhaligor",
        ru: "настроение",
        de: "stimmung",
        it: "umorecanale",
        "zh-CN": "心情检查",
        "pt-BR": "verhumor",
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
            return interaction.reply({
                content: `${getEmoji("reactions.kaeru.question")} Burada mesaj yok, hissedemiyorum...`,
                flags: MessageFlags.Ephemeral,
            });
        }
        if (!(channel instanceof TextChannel || channel instanceof ThreadChannel)) {
            return sendErrorMessage(interaction, "If it is not a text channel... then I cannot, sorry.", "info");
        }
        await interaction.deferReply();
        const messages = await channel.messages.fetch({ limit: 30 });
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
        output.split("\n").forEach(line => {
            const [mood, value] = line.split(":").map(s => s.trim());
            if (mood && value)
                moodValues[mood] = value;
        });
        const container = new ContainerBuilder()
            .addTextDisplayComponents(new TextDisplayBuilder().setContent(`-# ${getEmoji("magic")} Kāru Moodcheck AI`))
            .addSeparatorComponents(new SeparatorBuilder().setDivider(true))
            .addActionRowComponents(new ActionRowBuilder().addComponents(new ButtonBuilder()
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
            .setStyle(ButtonStyle.Secondary)));
        await interaction.editReply({
            components: [container],
            flags: MessageFlags.IsComponentsV2,
        });
        messages.clear();
    },
};
