import {
	CommandBuilder,
	CommandContext,
	IntegrationType,
	ModalBuilder,
	TextInputBuilder,
	TextInputStyle,
	LabelBuilder,
	ModalRoleSelectMenuBuilder,
	ModalChannelSelectMenuBuilder,
	ChannelType,
	InteractionFlags,
	ContainerBuilder,
	TextDisplayBuilder,
	AttachmentOptionBuilder,
	FileUploadBuilder,
} from "@minesa-org/mini-interaction";
import type {
	CommandInteraction,
	InteractionCommand,
} from "@minesa-org/mini-interaction";
import { db } from "../utils/database.ts";
import { getEmoji, sendAlertMessage } from "../utils/index.ts";

const ticketCommand: InteractionCommand = {
	data: new CommandBuilder()
		.setName("ticket")
		.setDescription("Manage the ticket system")
		.setContexts([CommandContext.Guild])
		.setIntegrationTypes([IntegrationType.GuildInstall])
		.setDefaultMemberPermissions(0x0000000000000020) // Manage Guild
		.addSubcommand((sub) =>
			sub
				.setName("setup")
				.setDescription("Configure the ticket system using a modal"),
		)
		.addSubcommand((sub) =>
			sub
				.setName("details")
				.setDescription("View current ticket system configuration"),
		)
		.addSubcommand((sub) =>
			sub
				.setName("default")
				.setDescription("Reset ticket system configuration to defaults"),
		),

	handler: async (interaction: CommandInteraction) => {
		const guild = interaction.guild;
		if (!guild) {
			return sendAlertMessage({
				interaction,
				content: "This command can only be used within a server.",
				type: "error",
			});
		}

		const subcommand = interaction.options.getSubcommand();

		if (subcommand === "setup") {
			const guildData = (await db.get(`guild:${guild.id}`)) as any || {};

			const modal = new ModalBuilder()
				.setCustomId("ticket-setup-modal")
				.setTitle("Ticket System Setup")
				.addComponents(
					new LabelBuilder()
						.setLabel("Description")
						.setDescription("Message displayed in the ticket creation channel")
						.setComponent(
							new TextInputBuilder()
								.setCustomId("description")
								.setPlaceholder("Markdown is supported")
								.setStyle(TextInputStyle.Paragraph)
								.setMaxLength(2000)
								.setRequired(false)
								.setValue(guildData.description || ""),
						),
					new LabelBuilder()
						.setLabel("Staff Role")
						.setDescription("Role to ping when a ticket is created")
						.setComponent(
							new ModalRoleSelectMenuBuilder()
								.setCustomId("staff-role")
								.setPlaceholder("Select a role")
								.setMinValues(1)
								.setMaxValues(1),
						),
					new LabelBuilder()
						.setLabel("Ticket Channel")
						.setDescription("Channel where the ticket creation message is sent")
						.setComponent(
							new ModalChannelSelectMenuBuilder()
								.setCustomId("channel")
								.setPlaceholder("Select a channel")
								.setMinValues(1)
								.setMaxValues(1),
						),
					new LabelBuilder()
						.setLabel("Banner Image URL")
						.setDescription("Optional image displayed at the top")
						.setComponent(
							new FileUploadBuilder()
								.setCustomId("banner_url").setMaxValues(1).setRequired(false)
						),
				);

			return interaction.showModal(modal);
		}

		if (subcommand === "details") {
			await interaction.deferReply({ flags: InteractionFlags.Ephemeral });
			const guildData = await db.get(`guild:${guild.id}`);

			if (!guildData) {
				return interaction.editReply({
					content: "No ticket configuration found for this server. Use `/ticket setup` to get started.",
				});
			}

			const container = new ContainerBuilder()
				.addComponent(
					new TextDisplayBuilder().setContent(`## ${getEmoji("sharedwithu")} Ticket System Details`),
				)
				.addComponent(
					new TextDisplayBuilder().setContent(
						`- **Staff Role:** ${guildData.pingRoleId ? `<@&${guildData.pingRoleId}>` : "None set (pings @here)"}\n` +
						`- **Ticket Channel:** ${guildData.ticketChannelId ? `<#${guildData.ticketChannelId}>` : "Default system channel"}\n` +
						`- **Banner URL:** ${guildData.bannerUrl ? `[Link](${guildData.bannerUrl})` : "None"}\n\n` +
						`**Description:**\n${guildData.description || "Default description"}`,
					),
				);

			return interaction.editReply({ components: [container] });
		}

		if (subcommand === "default") {
			await interaction.deferReply({ flags: InteractionFlags.Ephemeral });
			
			const guildData = await db.get(`guild:${guild.id}`);
			if (guildData) {
				const resetData = {
					guildId: guild.id,
					guildName: (guild as any).name,
					systemChannelId: (guild as any).system_channel_id,
					status: "active",
				};
				await db.set(`guild:${guild.id}`, resetData);
			}

			return interaction.editReply({
				content: `${getEmoji("seal")} Ticket configuration has been reset to defaults.`,
			});
		}
	},
};

export default ticketCommand;
