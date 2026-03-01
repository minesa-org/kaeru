import {
	type ComponentCommand,
	type ModalSubmitInteraction,
	InteractionFlags,
	ContainerBuilder,
	TextDisplayBuilder,
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	GalleryBuilder,
	GalleryItemBuilder,
} from "@minesa-org/mini-interaction";
import type { MessageActionRowComponent } from "@minesa-org/mini-interaction";
import { db } from "../../utils/database.ts";
import { getEmoji } from "../../utils/index.ts";
import { fetchDiscord } from "../../utils/discord.ts";

const ticketSetupModal: ComponentCommand = {
	customId: "ticket-setup-modal",

	handler: async (interaction: ModalSubmitInteraction) => {
		const guildId = interaction.guild_id;
		if (!guildId) return;

		await interaction.deferReply({ flags: InteractionFlags.Ephemeral });

		const description = interaction.getTextFieldValue("description");
		const staffRoleId = interaction.getSelectMenuValues("staff-role")?.[0];
		const bannerUrl = interaction.getComponentValue("banner_url") as string | undefined;
		const channelId = interaction.getSelectMenuValues("channel")?.[0];

		if (!channelId) {
			return interaction.editReply({
				content: `${getEmoji("error")} You must select a channel for the ticket system.`,
			});
		}

		try {
			// Update database
			const existingData = (await db.get(`guild:${guildId}`)) || {};
			const updatedData = {
				...existingData,
				guildId,
				description: description || existingData.description || "Create a ticket to get support from our staff.",
				pingRoleId: staffRoleId || existingData.pingRoleId,
				bannerUrl: bannerUrl || existingData.bannerUrl,
				ticketChannelId: channelId,
				status: "active",
			};

			// Remove internal fields if any
			delete (updatedData as any).createdAt;
			delete (updatedData as any).updatedAt;

			await db.set(`guild:${guildId}`, updatedData);

			// Prepare ticket creation message
			const oauthUrl = `https://discord.com/oauth2/authorize?client_id=${
				process.env.DISCORD_APPLICATION_ID
			}&response_type=code&redirect_uri=${encodeURIComponent(
				process.env.DISCORD_REDIRECT_URI || "",
			)}&scope=applications.commands+identify+guilds+role_connections.write&integration_type=1`;

			const authButton = new ActionRowBuilder<MessageActionRowComponent>().addComponents(
				new ButtonBuilder()
					.setLabel("Authorize App")
					.setStyle(ButtonStyle.Link)
					.setURL(oauthUrl),
			);

			// Create Ticket button removed as per user request to use DM flow

			const container = new ContainerBuilder()
				.addComponent(
					new TextDisplayBuilder().setContent(
						`## ${getEmoji("sharedwithu")} Support Center\n${updatedData.description}\n\n- To start a conversation, please **Authorize the App** and then **direct message (DM)** me!`,
					),
				);

			if (updatedData.bannerUrl) {
				container.addComponent(
					new GalleryBuilder().addItem(
						new GalleryItemBuilder().setMedia({ url: updatedData.bannerUrl as string }),
					),
				);
			}

			// Send to target channel (Include auth button as a separate component)
			await fetchDiscord(
				`/channels/${channelId}/messages`,
				process.env.DISCORD_BOT_TOKEN!,
				true,
				"POST",
				{ 
					components: [container.toJSON(), authButton.toJSON()],
					flags: 32768
				}
			);

			return interaction.editReply({
				content: `${getEmoji("seal")} Ticket system has been configured and the creation message was sent to <#${channelId}>.`,
			});
		} catch (error) {
			console.error("Error in ticket setup modal handler:", error);
			return interaction.editReply({
				content: `${getEmoji("error")} Failed to complete setup. Please check my permissions in <#${channelId}>.`,
			});
		}
	},
};

export default ticketSetupModal;
