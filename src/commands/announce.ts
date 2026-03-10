import {
	CommandBuilder,
	type CommandInteraction,
	type InteractionCommand,
	ModalBuilder,
	TextInputBuilder,
	TextInputStyle,
	LabelBuilder,
	ModalChannelSelectMenuBuilder,
	ModalRoleSelectMenuBuilder,
	FileUploadBuilder,
	CommandContext,
	IntegrationType,
	MiniPermFlags,
	ChannelType,
} from "@minesa-org/mini-interaction";
import { getEmoji } from "../utils/index.ts";

const announce: InteractionCommand = {
	data: new CommandBuilder()
		.setName("announce")
		.setDescription("Announce something to the server!")
		.setDefaultMemberPermissions(MiniPermFlags.ManageGuild)
		.setContexts([CommandContext.Guild])
		.setIntegrationTypes([IntegrationType.GuildInstall]),

	handler: async (interaction: CommandInteraction) => {
		const user = interaction.user ?? interaction.member?.user;
		const guildId = interaction.guild_id;

		if (!guildId || !user) {
			await interaction.reply({
				content: `${getEmoji("error")} This command can only be used in a server with a valid channel.`,
			});
			return;
		}

		const modal = new ModalBuilder()
			.setCustomId("announce-modal")
			.setTitle("Create Announcement")
			.addComponents(
				new LabelBuilder()
					.setLabel("Channel")
					.setDescription("Channel where the announcement will be posted")
					.setComponent(
						new ModalChannelSelectMenuBuilder()
							.setCustomId("announcement:channel")
							.setPlaceholder("Select a channel")
							.setMinValues(1)
							.setMaxValues(1)
							.setChannelTypes([
								ChannelType.GuildText,
								ChannelType.GuildAnnouncement,
							]),
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
					.setLabel("Role (Optional)")
					.setDescription("Role to mention in the announcement")
					.setComponent(
						new ModalRoleSelectMenuBuilder()
							.setCustomId("announcement:role")
							.setPlaceholder("Select a role")
							.setMinValues(1)
							.setMaxValues(1),
					),
				new LabelBuilder()
					.setLabel("Banner Image (Optional)")
					.setDescription("Upload a banner image for the announcement")
					.setComponent(
						new FileUploadBuilder()
							.setCustomId("announcement:banner")
							.setMaxValues(1)
							.setRequired(false),
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
