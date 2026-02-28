import {
	ActionRowBuilder,
	CommandBuilder,
	CommandContext,
	IntegrationType,
	StringSelectMenuBuilder,
	StringSelectMenuOptionBuilder,
	ButtonBuilder,
	ButtonStyle,
	ContainerBuilder,
	TextDisplayBuilder,
	InteractionFlags,
} from "@minesa-org/mini-interaction";
import type {
	CommandInteraction,
	InteractionCommand,
	MessageActionRowComponent,
} from "@minesa-org/mini-interaction";
import { db } from "../utils/database.ts";
import { fetchDiscord } from "../utils/discord.ts";
import { getEmoji, sendAlertMessage } from "../utils/index.ts";

const createCommand: InteractionCommand = {
	data: new CommandBuilder()
		.setName("create")
		.setDescription("Create a ticket thread in a mutual server")
		.setContexts([CommandContext.Bot])
		.setIntegrationTypes([
			IntegrationType.UserInstall,
			IntegrationType.GuildInstall,
		]),

	handler: async (interaction: CommandInteraction) => {
		const user = interaction.user ?? interaction.member?.user;

		if (!user) {
			return sendAlertMessage({
				interaction,
				content: "Could not resolve user.",
				type: "error",
			});
		}

		await interaction.deferReply({
			flags: InteractionFlags.IsComponentsV2 | InteractionFlags.Ephemeral,
		});

		let userTicketData;
		try {
			userTicketData = await db.get(`user:${user.id}`);
		} catch (dbError) {
			console.error("Database error getting user ticket data:", dbError);
			userTicketData = null; // Skip ticket check if database fails
		}

		if (userTicketData && userTicketData.activeTicketId) {
			let existingTicket;
			try {
				existingTicket = await db.get(
					`ticket:${userTicketData.activeTicketId}`,
				);
			} catch (dbError) {
				console.error("Database error getting ticket data:", dbError);
				existingTicket = null; // Skip ticket check if database fails
			}

			if (existingTicket && existingTicket.status === "open") {
				const container = new ContainerBuilder()
					.addComponent(
						new TextDisplayBuilder().setContent(
							`## ${getEmoji("error")} You already have an open ticket!`,
						),
					)
					.addComponent(
						new TextDisplayBuilder().setContent(
							"Please use `/send` command in DMs to communicate with staff.",
						),
					);

				return interaction.editReply({
					components: [container],
				});
			}
		}

		let userData;
		try {
			userData = await db.get(user.id);
		} catch (dbError) {
			console.error("Database error getting user data:", dbError);
			userData = null; // Treat as unauthorized if database fails
		}

		if (!userData || !userData.accessToken) {
			const oauthUrl = `https://discord.com/oauth2/authorize?client_id=${
				process.env.DISCORD_APPLICATION_ID
			}&response_type=code&redirect_uri=${encodeURIComponent(
				process.env.DISCORD_REDIRECT_URI!,
			)}&scope=applications.commands+identify+guilds+role_connections.write&integration_type=1`;

			const button = new ActionRowBuilder<MessageActionRowComponent>()
				.addComponents(
					new ButtonBuilder()
						.setLabel("Authorize App")
						.setStyle(ButtonStyle.Link)
						.setURL(oauthUrl),
				);

			const container = new ContainerBuilder()
				.addComponent(
					new TextDisplayBuilder().setContent(
						`## ${getEmoji("lock_fill")} Authorization Required`,
					),
				)
				.addComponent(
					new TextDisplayBuilder().setContent(
						"You have not authorized your account with the app. Click the button below to authorize.",
					),
				)
				.addComponent(button);

			return interaction.editReply({
				components: [container],
			});
		}

		try {
			let userGuilds;
			try {
				userGuilds = await fetchDiscord(
					"/users/@me/guilds",
					userData.accessToken as string,
					false,
					"GET",
					null,
					5000,
				);
			} catch (userError: any) {
				if (userError.message && userError.message.includes("401")) {
					const oauthUrl = `https://discord.com/oauth2/authorize?client_id=${
						process.env.DISCORD_APPLICATION_ID
					}&response_type=code&redirect_uri=${encodeURIComponent(
						process.env.DISCORD_REDIRECT_URI!,
					)}&scope=applications.commands+identify+guilds+role_connections.write&integration_type=1`;

					const button = new ActionRowBuilder<MessageActionRowComponent>()
						.addComponents(
							new ButtonBuilder()
								.setLabel("Authorize App")
								.setStyle(ButtonStyle.Link)
								.setURL(oauthUrl),
						);

					const container = new ContainerBuilder()
						.addComponent(
							new TextDisplayBuilder().setContent(
								`## ${getEmoji("lock_fill")} Re-authorization Required`,
							),
						)
						.addComponent(
							new TextDisplayBuilder().setContent(
								"Your authorization has expired. Click the button below to re-authorize.",
							),
						)
						.addComponent(button);

					return interaction.editReply({
						components: [container],
					});
				}
				throw userError;
			}
			
			const botGuilds = await fetchDiscord(
				"/users/@me/guilds",
				process.env.DISCORD_BOT_TOKEN!,
				true,
				"GET",
				null,
				5000,
			);

			const mutualGuilds = userGuilds.filter((ug: any) =>
				botGuilds.some((bg: any) => bg.id === ug.id),
			);

			if (mutualGuilds.length === 0) {
				return sendAlertMessage({
					interaction,
					content: "No mutual servers found. Make sure the bot is invited to the servers you are in.",
					type: "error",
				});
			}

			const menu = new ActionRowBuilder<MessageActionRowComponent>()
				.addComponents(
					new StringSelectMenuBuilder()
						.setCustomId("create:select_server")
						.setPlaceholder("Select a server to create a thread")
						.addOptions(
							...mutualGuilds
								.slice(0, 25)
								.map((guild: any) =>
									new StringSelectMenuOptionBuilder()
										.setLabel(guild.name)
										.setValue(guild.id),
								),
						),
				);

			const container = new ContainerBuilder()
				.addComponent(
					new TextDisplayBuilder().setContent(
						`## ${getEmoji("sharedwithu")} Creating a ticketmail`,
					),
				)
				.addComponent(
					new TextDisplayBuilder().setContent(
						"Please select a server where you want to open a ticketmail from the dropdown below.",
					),
				)
				.addComponent(menu);

			return interaction.editReply({
				components: [container],
			});
		} catch (error) {
			console.error("Error in /create command:", error);
			return sendAlertMessage({
				interaction,
				content: "An error occurred while fetching your servers. Please try again later.",
				type: "error",
			});
		}
	},
};

export default createCommand;
