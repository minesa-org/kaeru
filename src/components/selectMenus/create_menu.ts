import {
	ContainerBuilder,
	TextDisplayBuilder,
} from "@minesa-org/mini-interaction";
import type {
	InteractionComponent,
	MessageComponentInteraction,
	StringSelectInteraction,
} from "@minesa-org/mini-interaction";
import { db } from "../../utils/database.ts";
import { fetchDiscord } from "../../utils/discord.ts";
import { getEmoji } from "../../utils/index.ts";

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

		selectInteraction.deferUpdate();

		try {
			const [userTicketData, guildData, counterData] = await Promise.all([
				db.get(`user:${user.id}`),
				db.get(`guild:${guildId}`),
				db.get(`counter:${guildId}`),
			]);

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

			let guildName =
				typeof guildData?.guildName === "string" ? guildData.guildName : null;
			let systemChannelId =
				typeof guildData?.systemChannelId === "string"
					? guildData.systemChannelId
					: null;

			if (!guildName || (!guildData?.ticketChannelId && !systemChannelId)) {
				const guild = await fetchDiscord(
					`/guilds/${guildId}`,
					process.env.DISCORD_BOT_TOKEN!,
					true,
					"GET",
					null,
					3000,
				);

				guildName =
					typeof guild?.name === "string" && guild.name.length > 0
						? guild.name
						: guildName;
				systemChannelId =
					typeof guild?.system_channel_id === "string"
						? guild.system_channel_id
						: systemChannelId;
			}

			const targetChannelId =
				typeof guildData?.ticketChannelId === "string"
					? guildData.ticketChannelId
					: systemChannelId;

			if (!targetChannelId) {
				return selectInteraction.editReply({
					components: [
						buildErrorContainer(
							"This server does not have a usable ticket channel configured.",
						).toJSON(),
					],
				});
			}

			const caseNumber = Number(counterData?.lastCaseNumber || 0) + 1;

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

			console.info(
				`[Kaeru] Created thread ${thread.id} for /create in guild ${guildId}.`,
			);

			const ticketId = Date.now().toString();
			const pingMention = guildData?.pingRoleId
				? `<@&${guildData.pingRoleId}>`
				: "@here";

			const starterMessage = fetchDiscord(
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
				2500,
			).catch((messageError) => {
				console.error("Error sending initial thread message:", messageError);
				return null;
			});

			const guildRecord = {
				...(guildData || {}),
				guildId,
				...(guildName ? { guildName } : {}),
				...(systemChannelId ? { systemChannelId } : {}),
				status: "active",
			};

			const persistenceResults = await Promise.all([
				db.set(`counter:${guildId}`, {
					lastCaseNumber: caseNumber,
				}),
				db.set(`guild:${guildId}`, guildRecord),
				db.set(`ticket:${ticketId}`, {
					ticketId,
					caseNumber,
					guildId,
					channelId: targetChannelId,
					userId: user.id,
					username: user.username,
					threadId: thread.id,
					status: "open",
				}),
				db.set(`thread:${thread.id}`, {
					ticketId,
				}),
				db.set(`user:${user.id}`, {
					...(userTicketData || {}),
					activeTicketId: ticketId,
					guildId,
				}),
			]);

			void starterMessage;

			if (persistenceResults.some((result) => result === false)) {
				console.warn(
					`[Kaeru] Ticket ${ticketId} created for ${user.id}, but one or more persistence writes failed.`,
				);
			}

			const container = new ContainerBuilder()
				.addComponent(
					new TextDisplayBuilder().setContent(
						`## ${getEmoji("ticket.create")} Ticket created${guildName ? ` in ${guildName}` : ""}!\n` +
							`You can now continue with \`/send\` in DMs.\n<#${thread.id}>`,
					),
				);

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
	},
};

export default createMenuHandler;
