import {
	CommandBuilder,
	type CommandInteraction,
	type InteractionCommand,
	ModalBuilder,
	TextInputBuilder,
	TextInputStyle,
	LabelBuilder,
	ChannelType,
	InteractionFlags,
    MiniPermFlags,
} from "@minesa-org/mini-interaction";
import { db } from "../utils/database.ts";
import { getEmoji, sendAlertMessage } from "../utils/index.ts";

const announce: InteractionCommand = {
	data: new CommandBuilder()
		.setName("announce")
		.setDescription("Announce something to the server!")
		.setDefaultMemberPermissions(MiniPermFlags.ManageGuild),

	handler: async (interaction: CommandInteraction) => {
		const user = interaction.user;
		if (!user) return;

		const guildId = interaction.guild_id;
		if (!guildId) {
			return sendAlertMessage({
				interaction,
				content: "This command can only be used within a server.",
				type: "error",
			});
		}

		const channelId = interaction.channel_id;
		if (!channelId) return;

		// Store selection data temporarily for the modal handler
		await db.set(`announce_data:${user.id}`, {
			channelId,
		});

		const modal = new ModalBuilder()
			.setCustomId("announce-modal")
			.setTitle("Create Announcement")
			.addComponents(
				new LabelBuilder()
					.setLabel("Title")
					.setDescription("Heading for the announcement")
					.setComponent(
						new TextInputBuilder()
							.setCustomId("title")
							.setPlaceholder("Announcement")
							.setStyle(TextInputStyle.Short)
							.setMaxLength(100)
							.setRequired(false),
					),
				new LabelBuilder()
					.setLabel("Description")
					.setDescription("Message content. Use Markdown for formatting.")
					.setComponent(
						new TextInputBuilder()
							.setCustomId("description")
							.setPlaceholder("What is this announcement about?")
							.setStyle(TextInputStyle.Paragraph)
							.setMaxLength(4000)
							.setRequired(true),
					),
				new LabelBuilder()
					.setLabel("Banner (Optional URL)")
					.setDescription("Direct URL to a banner image")
					.setComponent(
						new TextInputBuilder()
							.setCustomId("banner_url")
							.setPlaceholder("https://example.com/banner.png")
							.setStyle(TextInputStyle.Short)
							.setRequired(false),
					),
				new LabelBuilder()
					.setLabel("Role (Optional Mention)")
					.setDescription("Role to mention (ID or @mention)")
					.setComponent(
						new TextInputBuilder()
							.setCustomId("role_input")
							.setPlaceholder("1477221006660599808 or @Announcements")
							.setStyle(TextInputStyle.Short)
							.setRequired(false),
					),
				new LabelBuilder()
					.setLabel("Button (Optional)")
					.setDescription("Format: url, label (e.g. https://google.com, Visit Site)")
					.setComponent(
						new TextInputBuilder()
							.setCustomId("button")
							.setPlaceholder("https://example.com, Visit site")
							.setStyle(TextInputStyle.Short)
							.setRequired(false),
					),
			);

		return interaction.showModal(modal);
	},
};

export default announce;