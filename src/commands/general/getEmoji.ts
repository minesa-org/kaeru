import {
	SlashCommandBuilder,
	ChatInputCommandInteraction,
	ApplicationIntegrationType,
	InteractionContextType,
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
} from "discord.js";
import type { BotCommand } from "../../interfaces/botTypes.js";
import { EmojiSize, getEmojiURL, sendAlertMessage } from "../../utils/export.js";

const emojiURL: BotCommand = {
	data: new SlashCommandBuilder()
		.setName("emoji-url")
		.setDescription("Get emoji URL.")
		.setIntegrationTypes([
			ApplicationIntegrationType.UserInstall,
			ApplicationIntegrationType.GuildInstall,
		])
		.setContexts([
			InteractionContextType.BotDM,
			InteractionContextType.PrivateChannel,
			InteractionContextType.Guild,
		])
		.addStringOption(option =>
			option
				.setName("emoji")
				.setDescription("Emoji to get URL for")
				.setRequired(true),
		)
		.addIntegerOption(option =>
			option
				.setName("size")
				.setDescription("Size of the emoji (in pixels)")
				.setRequired(false)
				.addChoices(
					{ name: "Small", value: EmojiSize.Small },
					{ name: "Medium", value: EmojiSize.Medium },
					{ name: "Large", value: EmojiSize.Large },
					{ name: "Maximum", value: EmojiSize.Max },
				),
		) as SlashCommandBuilder,

	execute: async (interaction: ChatInputCommandInteraction) => {
		const emoji = interaction.options.getString("emoji");
		const size = interaction.options.getInteger("size") ?? EmojiSize.Large;

		if (!emoji || !emoji.includes(":")) {
			return sendAlertMessage({
				interaction,
				content: "Invalid emoji.",
				type: "error",
				tag: "Invalid Emoji",
			});
		}

		try {
			const url = getEmojiURL(emoji, size);

			const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
				new ButtonBuilder()
					.setLabel("Open Emoji")
					.setStyle(ButtonStyle.Link)
					.setURL(url),
			);

			return interaction.reply({
				content: `**Emoji URL:**\n${url}`,
				components: [row],
			});
		} catch {
			return sendAlertMessage({
				interaction,
				content: "Failed to get emoji.",
				type: "error",
				tag: "Emoji Getting",
			});
		}
	},
};

export default emojiURL;
