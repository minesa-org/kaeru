import {
	ContainerBuilder,
	GalleryBuilder,
	GalleryItemBuilder,
	TextDisplayBuilder,
} from "@minesa-org/mini-interaction";
import { waitUntil } from "@vercel/functions";
import type {
	InteractionComponent,
	MessageComponentInteraction,
	StringSelectInteraction,
} from "@minesa-org/mini-interaction";
import { db } from "../../utils/database.ts";
import { fetchDiscord } from "../../utils/discord.ts";
import { getEmoji, getOrCreateWebhookUrl } from "../../utils/index.ts";

function buildLoadingContainer() {
	return new ContainerBuilder().addComponent(
		new TextDisplayBuilder().setContent(
			`## ${getEmoji("ticket.create")} Creating your ticket...\nThis can take a moment.`,
		),
	);
}

function buildErrorContainer(message: string) {
	return new ContainerBuilder()
		.addComponent(
			new TextDisplayBuilder().setContent(
				`## ${getEmoji("error")} Ticket creation failed`,
			),
		)
		.addComponent(new TextDisplayBuilder().setContent(message));
}

const createMenuHandler: InteractionComponent = {
	customId: "create:select_server",

	handler: async (interaction) => {
		const selectInteraction = interaction as StringSelectInteraction &
			MessageComponentInteraction;
		const guildId = selectInteraction.data.values[0];
		const user = selectInteraction.user ?? selectInteraction.member?.user;

		if (!guildId || !user) {
			return selectInteraction.update({
				content: "Could not resolve user or selected server.",
			});
		}

		const task = (async () => {
			try {
			const userTicketData = await db.get(`user:${user.id}`);
			if (userTicketData?.activeTicketId) {
				const existingTicket = await db.get(
					`ticket:${userTicketData.activeTicketId}`,
				);

				if (existingTicket?.status === "open") {
					const container = new ContainerBuilder()
						.addComponent(
							new TextDisplayBuilder().setContent(
								`## ${getEmoji("error")} You already have an open ticket!`,
							),
						)
						.addComponent(
							new TextDisplayBuilder().setContent(
								`Please use \`/send\` in DMs to continue.\n\nYour ticket: <#${existingTicket.threadId}>`,
							),
						);

					return selectInteraction.editReply({
						components: [container.toJSON()],
					});
				}
			}

			const guild = await fetchDiscord(
				`/guilds/${guildId}`,
				process.env.DISCORD_BOT_TOKEN!,
				true,
				"GET",
			);

			const guildData = await db.get(`guild:${guildId}`);
			const targetChannelId =
				guildData?.ticketChannelId ?? guild.system_channel_id;

			if (!targetChannelId) {
				return selectInteraction.editReply({
					components: [
						buildErrorContainer(
							"This server does not have a usable ticket channel configured.",
						).toJSON(),
					],
				});
			}

			let caseNumber = 1;
			const counterData = await db.get(`counter:${guildId}`);
			if (counterData?.lastCaseNumber) {
				caseNumber = Number(counterData.lastCaseNumber) + 1;
			}

			const thread = await fetchDiscord(
				`/channels/${targetChannelId}/threads`,
				process.env.DISCORD_BOT_TOKEN!,
				true,
				"POST",
				{
					name: `#${caseNumber} - ${user.username}`,
					auto_archive_duration: 10080,
					type: 12,
				},
			);

			const ticketId = Date.now().toString();
			const pingMention = guildData?.pingRoleId
				? `<@&${guildData.pingRoleId}>`
				: "@here";

			try {
				await fetchDiscord(
					`/channels/${thread.id}/messages`,
					process.env.DISCORD_BOT_TOKEN!,
					true,
					"POST",
					{
						components: [
							{
								type: 17,
								accent_color: null,
								spoiler: false,
								components: [
									{
										type: 10,
										content:
											`## ${getEmoji("ticket.create")} New Ticket #${caseNumber}\n` +
											`-# [ ${pingMention} ]\n\n**Created by:** ${user.username}`,
									},
									{
										type: 10,
										content:
											"-# Please assist this user with their inquiry using `/send`.",
									},
								],
							},
						],
						flags: 32768,
					},
				);
			} catch (messageError) {
				console.error("Error sending initial thread message:", messageError);
			}

			const webhookUrl = await getOrCreateWebhookUrl(
				targetChannelId,
				process.env.DISCORD_BOT_TOKEN!,
			);

			await db.set(`counter:${guildId}`, {
				lastCaseNumber: caseNumber,
			});

			await db.set(`guild:${guildId}`, {
				...(guildData || {}),
				guildId,
				guildName: guild.name,
				systemChannelId: guild.system_channel_id,
				ticketChannelId: guildData?.ticketChannelId,
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
			await db.set(`user:${user.id}`, {
				...(existingUserData || {}),
				activeTicketId: ticketId,
				guildId,
			});

			try {
				const authData = await db.get(user.id);
				if (authData?.accessToken) {
					let currentCount = 0;
					try {
						const metadataResponse = await fetch(
							`https://discord.com/api/v10/users/@me/applications/${process.env.DISCORD_APPLICATION_ID}/role-connection`,
							{
								headers: {
									Authorization: `Bearer ${authData.accessToken}`,
								},
							},
						);

						if (metadataResponse.ok) {
							const metadata = await metadataResponse.json();
							currentCount = Number(
								metadata.metadata?.threads_created || 0,
							);
						}
					} catch {}

					await fetch(
						`https://discord.com/api/v10/users/@me/applications/${process.env.DISCORD_APPLICATION_ID}/role-connection`,
						{
							method: "PUT",
							headers: {
								Authorization: `Bearer ${authData.accessToken}`,
								"Content-Type": "application/json",
							},
							body: JSON.stringify({
								platform_name: "Kaeru",
								metadata: {
									threads_created: currentCount + 1,
								},
							}),
						},
					);
				}
			} catch (metadataError) {
				console.error("Metadata update error:", metadataError);
			}

			const container = new ContainerBuilder()
				.addComponent(
					new TextDisplayBuilder().setContent(
						`## ${getEmoji("ticket.create")} Ticket created in ${guild.name}!\n` +
							`You can now continue with \`/send\` in DMs.\n<#${thread.id}>`,
					),
				);

			if (guild.icon) {
				container.addComponent(
					new GalleryBuilder().addItem(
						new GalleryItemBuilder().setMedia({
							url: `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`,
						}),
					),
				);
			}

			return selectInteraction.editReply({
				components: [container.toJSON()],
			});
			} catch (error) {
				console.error("Error in create menu handler:", error);
				return selectInteraction.editReply({
					components: [
						buildErrorContainer(
							"Failed to create thread. Check bot permissions in the selected server.",
						).toJSON(),
					],
				});
			}
		})();

		waitUntil(task);

		return selectInteraction.update({
			components: [buildLoadingContainer().toJSON()],
		});
	},
};

export default createMenuHandler;
