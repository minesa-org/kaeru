import {
	InteractionFlags,
	type StringSelectInteraction,
	type ComponentCommand,
	TextDisplayBuilder,
	ContainerBuilder,
	GalleryBuilder,
	GalleryItemBuilder,
} from "@minesa-org/mini-interaction";
import { fetchDiscord } from "../../utils/discord.ts";
import { db } from "../../utils/database.ts";
import { getEmoji, getOrCreateWebhookUrl } from "../../utils/index.ts";

export const createMenuHandler: ComponentCommand = {
	customId: "create:select_server",
	handler: async (interaction: StringSelectInteraction) => {
		const guildId = interaction.data.values[0];
		const user = interaction.user ?? interaction.member?.user;

		if (!user) {
			return interaction.reply({
				content: "Could not resolve user.",
				flags: InteractionFlags.Ephemeral,
			});
		}

		try {
			const userData = await db.get(`user:${user.id}`);
			if (userData && userData.activeTicketId) {
				const existingTicket = await db.get(
					`ticket:${userData.activeTicketId}`,
				);
				if (existingTicket && existingTicket.status === "open") {
					const container = new ContainerBuilder()
						.addComponent(
							new TextDisplayBuilder().setContent(
								`## ${getEmoji("error")} You already have an open ticket!`,
							),
						)
						.addComponent(
							new TextDisplayBuilder().setContent(
								`Please use \`/send\` command in DMs to communicate with staff.\n\nYour ticket: <#${existingTicket.threadId}>`,
							),
						);

					return interaction.update({
						components: [container],
						flags: InteractionFlags.IsComponentsV2 | InteractionFlags.Ephemeral,
					});
				}
			}

			const ticketId = Date.now().toString();
			let caseNumber = 1;
			try {
				const counterData: any = await db.get(`counter:${guildId}`);
				if (counterData && counterData.lastCaseNumber) {
					caseNumber = counterData.lastCaseNumber + 1;
				}
				await db.set(`counter:${guildId}`, {
					lastCaseNumber: caseNumber,
				});
			} catch (error) {
				caseNumber = 1; // Fallback
			}

			const guild = await fetchDiscord(
				`/guilds/${guildId}`,
				process.env.DISCORD_BOT_TOKEN!,
				true,
				"GET",
			);

			// Get guild data to check for custom ticket channel
			let ticketChannelId;
			try {
				const guildData = await db.get(`guild:${guildId}`);
				ticketChannelId = guildData?.ticketChannelId;
			} catch (dbError) {
				console.error("Error fetching guild data:", dbError);
			}

			// Use custom channel if set, otherwise fall back to system channel
			const targetChannelId = ticketChannelId || guild.system_channel_id;

			if (!targetChannelId) {
				return interaction.reply({
					content: "This server does not have a system channel configured. Please create a thread manually or tell the server owner to configure a system channel.",
					flags: InteractionFlags.Ephemeral,
				});
			}

			const threadResponse = await fetch(
				`https://discord.com/api/v10/channels/${targetChannelId}/threads`,
				{
					method: "POST",
					headers: {
						Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						name: `#${caseNumber} - ${user.username}`,
						auto_archive_duration: 10080, // 1 week
						type: 12, // Guild Private Thread
					}),
				},
			);

			if (!threadResponse.ok) {
				const errorTxt = await threadResponse.text();
				throw new Error(`Failed to create thread: ${threadResponse.status} ${errorTxt}`);
			}

			const thread = await threadResponse.json();

			try {
				let pingMention = "@here"; // Default fallback
				try {
					const guildData = await db.get(`guild:${guildId}`);
					if (
						guildData &&
						guildData.pingRoleId &&
						guildData.pingRoleId !== null
					) {
						pingMention = `<@&${guildData.pingRoleId}>`;
					}
				} catch (dbError) {}

				await fetch(
					`https://discord.com/api/v10/channels/${thread.id}/messages`,
					{
						method: "POST",
						headers: {
							Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
							"Content-Type": "application/json",
						},
						body: JSON.stringify({
							components: [
								{
									type: 17,
									accent_color: null,
									spoiler: false,
									components: [
										{
											type: 10,
											content: `## ${getEmoji("ticket.create")} New Ticket #${caseNumber}\n-# [ ${pingMention} ]\n\n**Created by:** ${user.username}`,
										},
										{
											type: 10,
											content: `-# Please assist this user with their inquiry using \`/send\` command.`,
										},
									],
								},
							],
							flags: 32768,
						}),
					},
				);
			} catch (messageError) {
				console.error("Error sending initial thread message:", messageError);
			}

			const webhookUrl = await getOrCreateWebhookUrl(targetChannelId, process.env.DISCORD_BOT_TOKEN!);


			try {
				await db.set(`guild:${guildId}`, {
					guildId,
					guildName: guild.name,
					systemChannelId: guild.system_channel_id,
					ticketChannelId,
					webhookUrl,
					status: "active",
				});

				await db.set(`ticket:${ticketId}`, {
					ticketId,
					caseNumber,
					guildId,
					channelId: targetChannelId,
					userId: user.id,
					username: user.username,
					threadId: thread.id,
					status: "open",
				});

				await db.set(`thread:${thread.id}`, {
					ticketId,
				});

				const existingUserData = await db.get(`user:${user.id}`);
				const updatedUserData: any = {
					...(existingUserData || {}),
					activeTicketId: ticketId,
					guildId,
				};
				delete updatedUserData.createdAt;
				delete updatedUserData.updatedAt;
				await db.set(`user:${user.id}`, updatedUserData);

				// Linked Roles metadata update (optional but nice to have)
				try {
					const userData = await db.get(user.id);
					if (userData && userData.accessToken) {
						let currentCount = 0;
						try {
							const metadataResponse = await fetch(
								`https://discord.com/api/v10/users/@me/applications/${process.env.DISCORD_APPLICATION_ID}/role-connection`,
								{
									headers: {
										Authorization: `Bearer ${userData.accessToken}`,
									},
								},
							);
							if (metadataResponse.ok) {
								const metadata = await metadataResponse.json();
								currentCount = Number(metadata.metadata?.threads_created || 0);
							}
						} catch (fetchError) {}

						const newCount = currentCount + 1;
						await fetch(
							`https://discord.com/api/v10/users/@me/applications/${process.env.DISCORD_APPLICATION_ID}/role-connection`,
							{
								method: "PUT",
								headers: {
									Authorization: `Bearer ${userData.accessToken}`,
									"Content-Type": "application/json",
								},
								body: JSON.stringify({
									platform_name: "Kāru",
									metadata: {
										threads_created: newCount,
									},
								}),
							},
						);
					}
				} catch (metadataError) {}
			} catch (dbError) {
				console.error("Database save error:", dbError);
				try {
					await fetch(`https://discord.com/api/v10/channels/${thread.id}`, {
						method: "DELETE",
						headers: { Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}` },
					});
				} catch (cleanupError) {}
				throw new Error("Failed to save ticket data to database");
			}

			const container = new ContainerBuilder()
				.addComponent(
					new TextDisplayBuilder().setContent(
						`## ${getEmoji("ticket.create")} Ticket created in ${guild.name}!\n` +
						`You can now send messages using \`/send\` command in our DMs!\n<#${thread.id}>`,
					),
				);

			if (guild.icon) {
				container.addComponent(
					new GalleryBuilder().addItem(
						new GalleryItemBuilder().setMedia({ url: `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png` }),
					),
				);
			}

			return interaction.update({
				components: [container.toJSON()],
				flags: InteractionFlags.IsComponentsV2,
			});
		} catch (error) {
			console.error("Error in create menu handler:", error);
			return interaction.reply({
				content: "Failed to create thread. Check bot permissions in the selected server.",
				flags: InteractionFlags.Ephemeral,
			});
		}
	},
};

export default createMenuHandler;
