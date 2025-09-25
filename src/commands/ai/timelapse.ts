import {
	ApplicationIntegrationType,
	ChatInputCommandInteraction,
	InteractionContextType,
	MessageFlags,
	SlashCommandBuilder,
	TextChannel,
	ThreadChannel,
} from "discord.js";
import { BotCommand } from "../../interfaces/botTypes.js";
import { karus } from "../../config/karu.js";
import {
	getEmoji,
	useCooldown,
	sendAlertMessage,
	containerTemplate,
	log,
} from "../../utils/export.js";

const timelapse: BotCommand = {
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
		})
		.addBooleanOption(option =>
			option
				.setName("ephemeral")
				.setNameLocalizations({
					tr: "geçici",
					ru: "эпфемерал",
					de: "ephemeral",
					it: "episodico",
					"zh-CN": "短暂",
					"pt-BR": "efêmero",
				})
				.setDescription("Make the message ephemeral")
				.setDescriptionLocalizations({
					tr: "Mesajı geçici yap",
					ru: "Сделать сообщение эфемеральным",
					de: "Mach die Nachricht ephemeral",
					it: "Rendi il messaggio episodico",
					"zh-CN": "使消息短暂",
					"pt-BR": "Tornar a mensagem efêmera",
					ro: "Faceți mesajul efemeră",
					el: "Κάντε το μήνυμα εφημερικό",
				})
				.setRequired(false),
		) as SlashCommandBuilder,

	execute: async (interaction: ChatInputCommandInteraction) => {
		const { channel } = interaction;
		if (
			await useCooldown(
				"timelapse",
				interaction.user.id,
				15,
				"Waittt! You are so fast, you will able to use it again",
				interaction,
			)
		)
			return;

		if (!(channel instanceof TextChannel || channel instanceof ThreadChannel)) {
			return sendAlertMessage({
				interaction,
				content: `Kaeru can only summarize text and thread type channels.\n\n> ${getEmoji("reactions.user.thumbsup")} Okay!`,
				type: "error",
				tag: "Channel Type",
			});
		}

		const ephemeral = interaction.options.getBoolean("ephemeral") || false;

		await interaction.deferReply({ flags: ephemeral ? MessageFlags.Ephemeral : [] });

		try {
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

			try {
				const completion = await karus.chat.completions.create({
					model: "x-ai/grok-4-fast:free",
					temperature: 0.2,
					messages: [{ role: "user", content: fullPrompt }],
				});

				const output = completion.choices[0]?.message?.content?.trim() || "";

				messages.clear();

				return interaction.editReply({
					components: [
						containerTemplate({
							tag: `${getEmoji("magic")} Kāru Timelapse Summary`,
							description: `>>> ${output}`,
							thumbnail:
								"https://media.discordapp.net/attachments/736571695170584576/1408561935041036298/Normal.png?ex=68aa3107&is=68a8df87&hm=dc29cb372f6f3f9429943429ac9db5d24772d4d2c54a7d40ddb9a6c1b9d6fc26&=&format=webp&quality=lossless&width=1410&height=1410",
						}),
					],
					flags: MessageFlags.IsComponentsV2,
				});
			} catch (err) {
				log("error", "Failed to summarize the channel:", err);

				return sendAlertMessage({
					interaction,
					content:
						"Failed to summarize Karu. The system might be confused — try again in a moment.",
					type: "error",
					tag: "AI Issue",
				});
			}
		} catch (err) {
			log("error", "Failed to summarize the channel:", err);

			return sendAlertMessage({
				interaction,
				content: "Failed to summarize Karu. The system might be confused — try again in a moment.",
				type: "error",
				tag: "AI Issue",
			});
		}
	},
};

export default timelapse;
