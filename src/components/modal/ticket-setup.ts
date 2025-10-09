import {
	ActionRowBuilder,
	bold,
	ButtonBuilder,
	ButtonStyle,
	ContainerBuilder,
	MediaGalleryBuilder,
	MediaGalleryItemBuilder,
	MessageFlags,
	ModalSubmitInteraction,
	NewsChannel,
	PermissionFlagsBits,
	SeparatorBuilder,
	SeparatorSpacingSize,
	TextChannel,
	TextDisplayBuilder,
	underline,
} from "discord.js";
import type { BotComponent } from "../../interfaces/botTypes.js";
import { isValidImageUrl } from "../../utils/isValidImageUrl.js";
import { emojis, getEmoji } from "../../utils/emojis.js";
import { saveStaffRoleId } from "../../utils/guildManager.js";
import { containerTemplate, sendAlertMessage } from "../../utils/error&containerMessage.js";

const setupTicketModal: BotComponent = {
	customId: "ticket-setup-modal",

	execute: async (interaction: ModalSubmitInteraction): Promise<void> => {
		const { guild } = interaction;

		const TICKET_MESSAGE =
			interaction.fields.getTextInputValue("ticket-setup-description") ??
			[
				`# ${getEmoji("button")} Create a Ticket`,
				`If you're experiencing an issue with our product or service, please use the "Create ticket" button to report it.`,
				`-# This includes any server-related tickets you may be encountering in our Discord server.`,
			].join("\n");
		const STAFF_ROLE = interaction.fields.getSelectedRoles("ticket-setup-staff-role", true).first();
		const IMAGE_URL = interaction.fields.getTextInputValue("ticket-setup-image-url");
		const SEND_TO_CHANNEL = interaction.fields
			.getSelectedChannels("ticket-setup-channel", true)
			.first();

		if (!guild?.members.me?.permissions.has("ManageThreads")) {
			return sendAlertMessage({
				interaction,
				content: `It seems like I can't manage threads.\n> ${getEmoji("reactions.user.thumbsup")} Got it! I will give you the permission to manage, soon.`,
				type: "error",
				tag: "Missing Permissions",
				alertReaction: "reactions.kaeru.emphasize",
			});
		}

		if (!guild?.members.me?.permissions.has("CreatePrivateThreads")) {
			return sendAlertMessage({
				interaction,
				content: `It seems like I can't create private threads.\n> ${getEmoji("reactions.user.thumbsup")} Got it! I will give you the permission to manage, soon.`,
				type: "error",
				tag: "Missing Permissions",
				alertReaction: "reactions.kaeru.emphasize",
			});
		}

		const sendingChannel =
			SEND_TO_CHANNEL instanceof TextChannel || SEND_TO_CHANNEL instanceof NewsChannel
				? SEND_TO_CHANNEL
				: null;

		if (
			!interaction.guild ||
			!sendingChannel ||
			!("permissionsFor" in sendingChannel) ||
			!sendingChannel
				.permissionsFor(interaction.guild.members.me!)
				.has([PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages])
		) {
			await interaction.reply({
				content: `# ${getEmoji("danger")}\n-# I don't have permission to send messages or view ${sendingChannel ?? "the"} channel.`,
			});
		}

		await interaction.deferReply();

		let imageUrl =
			"https://cdn.discordapp.com/attachments/736571695170584576/1422748982047932438/Default_Card.png?ex=68ddcdbe&is=68dc7c3e&hm=b16c3ef319ec1633a6798954492a4f3d58114422af50d1e0be9511a459e8ee4f&";

		if (IMAGE_URL) {
			if (isValidImageUrl(IMAGE_URL)) {
				imageUrl = IMAGE_URL;
			} else {
				await interaction.editReply({
					content: `# ${getEmoji("danger")}\n-# The provided image URL is not valid. Please provide a direct link to an image (jpg, png, gif, etc.) or a supported image hosting service.\n> -# **Supported image hosting services:**\n> -# Discord, Imgur, Gyazo, Prnt.sc, i.redd.it, Tenor, Giphy`,
				});
			}
		}

		const container = new ContainerBuilder()
			.setAccentColor(0xa2845e)
			.addTextDisplayComponents(
				new TextDisplayBuilder().setContent(
					TICKET_MESSAGE ||
						[
							`# ${getEmoji("button")} Create a Ticket`,
							`If you're experiencing an issue with our product or service, please use the "Create ticket" button to report it.`,
							`-# This includes any server-related tickets you may be encountering in our Discord server.`,
						].join("\n"),
				),
			)
			.addSeparatorComponents(
				new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large).setDivider(true),
			)
			.addMediaGalleryComponents(
				new MediaGalleryBuilder().addItems(new MediaGalleryItemBuilder().setURL(imageUrl)),
			);

		const containerButton = new ActionRowBuilder<ButtonBuilder>().addComponents(
			new ButtonBuilder()
				.setCustomId("ticket-create-button")
				.setEmoji(emojis.ticket.create)
				.setLabel("Create ticket")
				.setStyle(ButtonStyle.Secondary),
		);

		await sendingChannel?.send({
			components: [container, containerButton],
			flags: MessageFlags.IsComponentsV2,
		});
		await saveStaffRoleId(interaction.guild!.id, STAFF_ROLE!.id);

		await interaction.editReply({
			components: [
				containerTemplate({
					tag: "System Created",
					title: `${getEmoji("ticket.create")} Created the ticket system successfully in ${sendingChannel}.`,
					description: [
						`- Users can create tickets as thread with selecting label`,
						`- It will auto-name the thread for their issue.`,
						`- Experience PRO ticket handling.`,
					].join("\n"),
				}),
			],
			flags: [MessageFlags.IsComponentsV2],
		});

		if (!interaction.guild!.members.me?.permissions.has(PermissionFlagsBits.ManageMessages)) {
			return sendAlertMessage({
				interaction,
				content: `## ${getEmoji("danger") + " " + underline("Recommending")}\nIf Kaeru has ${bold(
					"Manage Messages",
				)} permission, it will be very easy to reach the first message with pinned messages for staff members.`,
			});
		}
	},
};

export default setupTicketModal;
