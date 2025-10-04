import {
	ApplicationCommandType,
	ApplicationIntegrationType,
	ContextMenuCommandBuilder,
	InteractionContextType,
	MessageFlags,
	MessageContextMenuCommandInteraction,
} from "discord.js";
import { karus } from "../../config/karu.js";
import type { BotCommand } from "../../interfaces/botTypes.js";
import { getEmoji, log, langMap, sendAlertMessage } from "../../utils/export.js";

function splitMessageBy2000(str: string) {
	const chunks: string[] = [];
	for (let i = 0; i < str.length; i += 2000) {
		chunks.push(str.slice(i, i + 2000));
	}
	return chunks;
}

const messageTranslate: BotCommand = {
	data: new ContextMenuCommandBuilder()
		.setName("Translate")
		.setNameLocalizations({
			it: "Traduci Messaggio",
			tr: "Mesajı Çevir",
			ro: "Traduceți Mesajul",
			el: "Μετάφραση Μηνύματος",
			"zh-CN": "翻译消息",
			"pt-BR": "Traduzir Messaggio",
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

	execute: async (interaction: MessageContextMenuCommandInteraction) => {
		const message = interaction.targetMessage;

		if (!message || typeof message.content !== "string" || message.content.trim() === "") {
			return sendAlertMessage({
				interaction,
				content:
					"This message seems to hold no content—nothing to translate so... this means nothing to translate. \n-# Message shouldn't be inside an embed or container telling it in case c:",
				type: "info",
			});
		}

		try {
			await interaction.deferReply({ flags: MessageFlags.Ephemeral });

			const safeMessage = message.content.replace(/<a?:.+?:\d{18}>/g, "").trim();

			const fullLocale = interaction.locale || "en-US";
			const intl = new Intl.Locale(fullLocale);
			const rawLang = intl.language.toLowerCase();

			const targetLang = langMap[fullLocale.toLowerCase()] || langMap[rawLang] || "English";

			const systemPrompt = `
You are a professional translator fluent in both English and the target language (${targetLang}). 

Your task is to:
1. Clean and correct the input message while preserving its meaning, tone, and paragraphs.
2. Translate the entire message naturally and fluently into ${targetLang}, preserving paragraphs and implied emotions.

Return exactly two sections, labeled:

Cleaned:
[Corrected and cleaned original message]

Translated:
[Natural, fluent translation]

Do NOT add anything else.
`.trim();

			const completion = await karus.chat.completions.create({
				model: "deepseek/deepseek-chat-v3.1:free",
				temperature: 0.3,
				top_p: 1,
				messages: [
					{ role: "system", content: systemPrompt },
					{ role: "user", content: safeMessage },
				],
			});

			const raw = completion.choices[0]?.message?.content?.trim() || "";

			const cleanedMatch = raw.match(/Cleaned:\s*([\s\S]*?)\nTranslated:/i);
			const translatedMatch = raw.match(/Translated:\s*([\s\S]*)/i);

			const cleaned = cleanedMatch?.[1]?.trim();
			const translated = translatedMatch?.[1]?.trim();

			if (!cleaned || !translated) {
				throw new Error("Malformed response from AI");
			}

			const formattedCleaned = cleaned.replace(/\\n/g, "\n");
			const formattedTranslated = translated.replace(/\\n/g, "\n");

			const finalOutput = `### ${getEmoji("globe")} Cleaned\n${formattedCleaned}\n\n### ${getEmoji("swap")} Translated\n${formattedTranslated}`;

			const chunks = splitMessageBy2000(finalOutput);

			await interaction.editReply({
				content: chunks[0],
				allowedMentions: { parse: [] },
			});

			for (let i = 1; i < chunks.length; i++) {
				await interaction.followUp({
					content: chunks[i],
					flags: MessageFlags.Ephemeral,
					allowedMentions: { parse: [] },
				});
			}
		} catch (err) {
			log("error", "Failed to translate the message:", err);

			return sendAlertMessage({
				interaction,
				content: "Failed to translate Karu. The system might be confused — try again in a moment.",
				type: "error",
				tag: "AI Issue",
			});
		}
	},
};

export default messageTranslate;
