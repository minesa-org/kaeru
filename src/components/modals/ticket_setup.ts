import {
	InteractionFlags,
	MessageFlags,
	ContainerBuilder,
	TextDisplayBuilder,
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	GalleryBuilder,
	GalleryItemBuilder,
} from "@minesa-org/mini-interaction";
import type { InteractionModal, MessageActionRowComponent } from "@minesa-org/mini-interaction";
import { db } from "../../utils/database.ts";
import { getEmoji } from "../../utils/index.ts";

function getAttachmentFilename(url: string, fallback = "ticket-banner.png") {
	try {
		const pathname = new URL(url).pathname;
		const lastSegment = pathname.split("/").pop();
		if (!lastSegment) return fallback;
		return decodeURIComponent(lastSegment) || fallback;
	} catch {
		return fallback;
	}
}

async function downloadAttachment(url: string) {
	const response = await fetch(url);
	if (!response.ok) {
		throw new Error(
			`Failed to download attachment: ${response.status} ${response.statusText}`,
		);
	}

	return {
		bytes: await response.arrayBuffer(),
		mimeType: response.headers.get("content-type") || "application/octet-stream",
	};
}

const ticketSetupModal: InteractionModal = {
	customId: "ticket-setup-modal",

	handler: async (interaction) => {
		const guildId = interaction.guild_id;
		if (!guildId) return;

		await interaction.deferReply({ flags: InteractionFlags.Ephemeral });

		const description = interaction.getTextFieldValue("description");
		const staffRoleId = interaction.getSelectMenuValues("staff-role")?.[0];
		const staffPingMode =
			interaction.getSelectMenuValues("staff-ping-mode")?.[0] === "random"
				? "random"
				: "role";
		const bannerAttachment = interaction.getAttachment("banner_url");
		const bannerUrl = bannerAttachment?.url;
		const bannerFilename = bannerUrl ? getAttachmentFilename(bannerUrl) : null;
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
				description:
					description ||
					existingData.description ||
					"Create a ticket to get support from our staff.",
				pingRoleId: staffRoleId || existingData.pingRoleId,
				staffPingMode,
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

			const container = new ContainerBuilder().addComponent(
				new TextDisplayBuilder().setContent(
					`## ${getEmoji("sharedwithu")} Support Center\n${updatedData.description}\n\n- To start a conversation, please **Authorize the App** and then **direct message (DM)** me!`,
				),
			);

			let bannerUpload:
				| {
					bytes: ArrayBuffer;
					mimeType: string;
				}
				| null = null;

			if (bannerUrl && bannerFilename) {
				try {
					bannerUpload = await downloadAttachment(bannerUrl);
					container.addComponent(
						new GalleryBuilder().addItem(
							new GalleryItemBuilder().setMedia({
								url: `attachment://${bannerFilename}`,
							}),
						),
					);
				} catch (error) {
					console.warn("[Kaeru] Failed to re-upload ticket banner attachment:", error);
				}
			}

			const payload = {
				components: [container.toJSON(), authButton.toJSON()],
				flags: MessageFlags.IsComponentsV2,
				...(bannerUpload && bannerFilename
					? {
						attachments: [
							{
								id: 0,
								filename: bannerFilename,
								description: "Ticket banner",
							},
						],
					}
					: {}),
			};

			const response = bannerUpload && bannerFilename
				? await fetch(`https://discord.com/api/v10/channels/${channelId}/messages`, {
					method: "POST",
					headers: {
						Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
					},
					body: (() => {
						const formData = new FormData();
						formData.append("payload_json", JSON.stringify(payload));
						formData.append(
							"files[0]",
							new Blob([bannerUpload.bytes], { type: bannerUpload.mimeType }),
							bannerFilename,
						);
						return formData;
					})(),
				})
				: await fetch(`https://discord.com/api/v10/channels/${channelId}/messages`, {
					method: "POST",
					headers: {
						Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
						"Content-Type": "application/json",
					},
					body: JSON.stringify(payload),
				});

			if (!response.ok) {
				throw new Error(
					`Discord API error: ${response.status} ${await response.text()}`,
				);
			}

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
