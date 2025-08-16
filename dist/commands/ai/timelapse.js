import { ApplicationIntegrationType, ContainerBuilder, InteractionContextType, MessageFlags, SlashCommandBuilder, TextChannel, TextDisplayBuilder, ThreadChannel, } from "discord.js";
import { karu } from "../../config/karu.js";
import { getEmoji, useCooldown, sendErrorMessage } from "../../utils/export.js";
const timelapse = {
    data: new SlashCommandBuilder()
        .setContexts(InteractionContextType.Guild)
        .setIntegrationTypes(ApplicationIntegrationType.GuildInstall)
        .setName("timelapse")
        .setDescription("See channel's summary")
        .setNameLocalizations({
        tr: "zamanatlaması",
        ru: "таймлапс",
        de: "zeitraffer",
        it: "timelapse",
        "zh-CN": "延时",
        "pt-BR": "timelapse",
    })
        .setDescriptionLocalizations({
        tr: "Kanalın özetini gör",
        ru: "Посмотреть сводку канала",
        de: "Siehe die Zusammenfassung des Kanals",
        it: "Vedi il riepilogo del canale",
        "zh-CN": "查看频道摘要",
        "pt-BR": "Veja o resumo do canal",
    }),
    execute: async (interaction) => {
        const { channel } = interaction;
        if (await useCooldown("timelapse", interaction.user.id, 15, "Waittt! You are so fast, you will able to use it again", interaction))
            return;
        if (!(channel instanceof TextChannel || channel instanceof ThreadChannel)) {
            return sendErrorMessage(interaction, `-# Kaeru can only summarize text and thread type channels.\n\n> ${getEmoji("reactions.user.thumbsup")} Okay! I have to go to **message** then apps and click __Summarize & Key Points__ on the message.`, "reactions.kaeru.question");
        }
        await interaction.deferReply();
        const messages = await channel.messages.fetch({ limit: 30 });
        const sortedMessages = messages.sort((a, b) => a.createdTimestamp - b.createdTimestamp);
        const content = sortedMessages
            .map(msg => {
            const name = msg.member?.displayName || msg.author.username;
            return `${name}: ${msg.content}`;
        })
            .join("\n");
        const fullPrompt = `
You are an AI assistant. Summarize the following Discord messages in a short, continuous text. 
Do not create lists, bullet points, or key points. Just condense the messages into a brief readable text.

Messages:
${content}
`;
        const model = karu.getGenerativeModel({
            model: "gemma-3n-e4b-it",
            generationConfig: {
                temperature: 0.2,
                maxOutputTokens: 800,
                topK: 1,
                topP: 1,
            },
        });
        const result = await model.generateContent(fullPrompt);
        const output = result.response.text().trim();
        const container = new ContainerBuilder().addTextDisplayComponents(new TextDisplayBuilder().setContent(`-# ${getEmoji("magic")} Kāru Timelapse Summary`), new TextDisplayBuilder().setContent(`>>> ${output}`));
        await interaction.editReply({
            components: [container],
            flags: MessageFlags.IsComponentsV2,
        });
        messages.clear();
    },
};
export default timelapse;
