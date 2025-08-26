import { ApplicationCommandType, ApplicationIntegrationType, ContextMenuCommandBuilder, InteractionContextType, MessageFlags, } from "discord.js";
import { karu } from "../../config/karu.js";
import { getEmoji, log, langMap, sendAlertMessage, containerTemplate, } from "../../utils/export.js";
const messageSummary = {
    data: new ContextMenuCommandBuilder()
        .setName("Summary & Key Points")
        .setNameLocalizations({
        it: "Riepilogo & Punti Chiave",
        tr: "Özet & Ana Noktalar",
        ro: "Rezumat & Punctele Cheie",
        el: "Περίληψη & Κεντρικοί Πόντοι",
        "zh-CN": "摘要 & 关键点",
        "pt-BR": "Resumo & Pontos-chave",
    })
        .setType(ApplicationCommandType.Message)
        .setIntegrationTypes([
        ApplicationIntegrationType.UserInstall,
        ApplicationIntegrationType.GuildInstall,
    ])
        .setContexts([
        InteractionContextType.BotDM,
        InteractionContextType.PrivateChannel,
        InteractionContextType.Guild,
    ]),
    execute: async (interaction) => {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });
        const message = interaction.targetMessage;
        if (!message || typeof message.content !== "string" || message.content.trim() === "") {
            return sendAlertMessage({
                interaction,
                content: "This message seems to hold no content—nothing to summarize so... this means nothing to summarize. \n-# Message shouldn't be inside an embed or container telling it in case c:",
                tag: "Channel Type",
            });
        }
        try {
            let textToSummarize = "";
            if (message.content && message.content.trim() !== "") {
                textToSummarize += message.content.trim() + "\n";
            }
            if (message.embeds.length > 0) {
                for (const embed of message.embeds) {
                    if (embed.title)
                        textToSummarize += embed.title + "\n";
                    if (embed.description)
                        textToSummarize += embed.description + "\n";
                    if (embed.fields) {
                        for (const field of embed.fields) {
                            textToSummarize += `${field.name}: ${field.value}\n`;
                        }
                    }
                }
            }
            if (textToSummarize.trim() === "") {
                return sendAlertMessage({
                    interaction,
                    content: `# ${getEmoji("info")} \nEmbeds, attachments or system messages can't be summarized. Maybe give it a try with a text message?`,
                    tag: "Unsupported Message",
                });
            }
            const fullLocale = interaction.locale || "en-US";
            const intl = new Intl.Locale(fullLocale);
            const rawLang = intl.language.toLowerCase();
            const targetLang = langMap[fullLocale.toLowerCase()] || langMap[rawLang] || "English";
            const prompt = `
Summarize the following text into ONE clear, concise paragraph in ${targetLang}. Then list the KEY POINTS as bullet points in ${targetLang}. Do NOT add opinions or extra details.

Text:
"""${textToSummarize.trim()}"""

Format:
Summary:
[summary paragraph]

Key Points:
- point 1
- point 2
- point 3
`.trim();
            try {
                const model = karu.getGenerativeModel({
                    model: "gemma-3n-e4b-it",
                    generationConfig: {
                        temperature: 0.3,
                        maxOutputTokens: 1024,
                        topP: 0.9,
                        topK: 10,
                    },
                });
                const result = await model.generateContent([prompt]);
                const output = result.response.text();
                if (!output) {
                    throw new Error("No response text from model");
                }
                const [summarySection, keyPointSection] = output
                    .split(/Key Points:\n?/i)
                    .map((s) => s.trim());
                const summary = summarySection.replace(/^Summary:\n?/i, "").trim();
                const keyPoints = keyPointSection.trim();
                const summaryTextSection = [`## ${getEmoji("text_append")} Summarized`, summary].join("\n");
                const keyPointsTextSection = [`## ${getEmoji("list_bullet")} Key Points`, keyPoints].join("\n");
                return await interaction.editReply({
                    components: [
                        containerTemplate({
                            tag: "Summary & Key-Points System",
                            description: [summaryTextSection, "", keyPointsTextSection],
                        }),
                    ],
                    flags: MessageFlags.IsComponentsV2,
                });
            }
            catch (err) {
                log("error", "Failed to summarize the message:", err);
                return sendAlertMessage({
                    interaction,
                    content: "Failed to summarize Karu. The system might be confused — try again in a moment.",
                    type: "error",
                    tag: "AI Issue",
                });
            }
        }
        catch (err) {
            log("error", "Failed to summarize the message:", err);
            return sendAlertMessage({
                interaction,
                content: "Failed to summarize Karu. The system might be confused — try again in a moment.",
                type: "error",
                tag: "AI Issue",
            });
        }
    },
};
export default messageSummary;
