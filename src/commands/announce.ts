import {
	CommandBuilder,
	type CommandInteraction,
	type InteractionCommand,
	ModalBuilder,
	TextInputBuilder,
	TextInputStyle,
	LabelBuilder,
	FileUploadBuilder,
	ModalRoleSelectMenuBuilder,
	CommandContext,
	IntegrationType,
} from "@minesa-org/mini-interaction";
import { PermissionFlagsBits } from "discord-api-types/v10";

const announce: InteractionCommand = {
	data: new CommandBuilder()
		.setName("announce")
		.setDescription("Announce something to the server!")
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
		.setContexts([CommandContext.Guild])
		.setIntegrationTypes([IntegrationType.GuildInstall]),

	handler: async (interaction: CommandInteraction) => {
		const modal = new ModalBuilder()
			.setCustomId("announce-modal")
			.setTitle("Create Announcement")
			.addComponents(
				new LabelBuilder()
					.setLabel("Title")
					.setDescription("Heading for the announcement")
					.setComponent(
						new TextInputBuilder()
							.setCustomId("announcement:title")
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
							.setCustomId("announcement:description")
							.setPlaceholder("What is this announcement about?")
							.setStyle(TextInputStyle.Paragraph)
							.setMaxLength(4000)
							.setRequired(true),
					),
				new LabelBuilder()
					.setLabel("Banner")
					.setDescription("Upload an attachment to set a banner for the post")
					.setComponent(
						new FileUploadBuilder()
							.setCustomId("announcement:attachment")
							.setMaxValues(1)
							.setRequired(false),
					),
				new LabelBuilder()
					.setLabel("Select Role")
					.setDescription("Role to mention")
					.setComponent(
						new ModalRoleSelectMenuBuilder()
							.setCustomId("announcement:role")
							.setPlaceholder("Select a role")
							.setMinValues(0)
							.setMaxValues(1),
					),
				new LabelBuilder()
					.setLabel("Button (Optional)")
					.setDescription("Format: url, label (e.g. https://discord.gg/minesa, Join us!)")
					.setComponent(
						new TextInputBuilder()
							.setCustomId("announcement:button")
							.setPlaceholder("https://example.com, Visit site")
							.setStyle(TextInputStyle.Short)
							.setRequired(false),
					),
			);
		return interaction.showModal(modal);
	},
};

export default announce;
