import { ApplicationIntegrationType, InteractionContextType, MessageFlags, SlashCommandBuilder, TextChannel, ThreadChannel, } from "discord.js";
import { karu } from "../../config/karu.js";
import { getEmoji, useCooldown, sendAlertMessage, containerTemplate } from "../../utils/export.js";
const timelapse = {
    data: new SlashCommandBuilder()
        .setContexts(InteractionContextType.Guild)
        .setIntegrationTypes(ApplicationIntegrationType.GuildInstall)
        .setName("timelapse")
        .setDescription("See channel's summary using AI")
        .setNameLocalizations({
        tr: "zamanatlaması",
        ru: "таймлапс",
        de: "zeitraffer",
        it: "timelapse",
        "zh-CN": "延时",
        "pt-BR": "timelapse",
    })
        .setDescriptionLocalizations({
        tr: "YZ kullanarak kanalın özetini gör",
        ru: "Посмотреть сводку канала с помощью ИИ",
        de: "Siehe die Zusammenfassung des Kanals mit KI",
        it: "Vedi il riepilogo del canale usando l'IA",
        "zh-CN": "使用AI查看频道摘要",
        "pt-BR": "Veja o resumo do canal usando IA",
    }),
    execute: async (interaction) => {
        const { channel } = interaction;
        if (await useCooldown("timelapse", interaction.user.id, 15, "Waittt! You are so fast, you will able to use it again", interaction))
            return;
        if (!(channel instanceof TextChannel || channel instanceof ThreadChannel)) {
            return sendAlertMessage({
                interaction,
                content: `Kaeru can only summarize text and thread type channels.\n\n> ${getEmoji("reactions.user.thumbsup")} Okay!`,
                type: "error",
                tag: "Channel Type",
            });
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
        messages.clear();
        return interaction.editReply({
            components: [
                containerTemplate({
                    tag: `${getEmoji("magic")} Kāru Timelapse Summary`,
                    description: `>>> ${output}`,
                    thumbnail: "https://media.discordapp.net/attachments/736571695170584576/1408561935041036298/Normal.png?ex=68aa3107&is=68a8df87&hm=dc29cb372f6f3f9429943429ac9db5d24772d4d2c54a7d40ddb9a6c1b9d6fc26&=&format=webp&quality=lossless&width=1410&height=1410",
                }),
            ],
            flags: MessageFlags.IsComponentsV2,
        });
    },
};
export default timelapse;
