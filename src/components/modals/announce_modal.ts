import {
	type ComponentCommand,
	type ModalSubmitInteraction,
	InteractionFlags,
	ContainerBuilder,
	TextDisplayBuilder,
	SeparatorBuilder,
	SeparatorSpacingSize,
	GalleryBuilder,
	GalleryItemBuilder,
	ButtonBuilder,
	ButtonStyle,
	ActionRowBuilder,
} from "@minesa-org/mini-interaction";
import type { MessageActionRowComponent } from "@minesa-org/mini-interaction";
import { db } from "../../utils/database.ts";
import { getEmoji, sendAlertMessage, getEmojiData } from "../../utils/index.ts";
import { fetchDiscord } from "../../utils/discord.ts";



const announceModal: ComponentCommand = {
	customId: "announce-modal",

	handler: async (interaction: ModalSubmitInteraction) => {
		const user = interaction.user;
		if (!user) return;
		
		const userId = user.id;
		const guildId = interaction.guild_id;
		if (!guildId) return;

		await interaction.deferReply({ flags: InteractionFlags.Ephemeral });

		// Retrieve stored data
		const announceData = (await db.get(`announce_data:${userId}`)) as any;
		if (!announceData) {
			return interaction.editReply({
				content: `${getEmoji("error")} Could not find announcement data. Please try the command again.`,
			});
		}

		const { channelId } = announceData;
		const title = interaction.getTextFieldValue("title") || "Announcement";
		const description = interaction.getTextFieldValue("description") || "";
		const buttonInput = interaction.getTextFieldValue("button");
		const bannerUrl = interaction.getTextFieldValue("banner_url");
		const roleInput = interaction.getTextFieldValue("role_input");

		try {
			const container = new ContainerBuilder();
			const gallery = new GalleryBuilder();
			let hasMedia = false;

			// Handle Banner from Modal
			if (bannerUrl) {
				gallery.addItem(new GalleryItemBuilder().setMedia({ url: bannerUrl as string }));
				hasMedia = true;
			}

			if (hasMedia) {
				container.addComponent(gallery);
			}

			// Determine role mention
			let finalMention = "[no mention.]";
			if (roleInput) {
				// If it's just an ID, wrap it. If it's already a mention, use as is.
				const cleanRole = roleInput.replace(/[<@&>]/g, "");
				if (/^\d+$/.test(cleanRole)) {
					finalMention = `<@&${cleanRole}>`;
				} else {
					finalMention = roleInput;
				}
			}

			// Build Content
			const contentLines = [
				`# ${title}`,
				"",
				`-# ${finalMention}`,
				"",
				description,
			].join("\n");

			container.addComponent(new TextDisplayBuilder().setContent(contentLines));

			// Handle Button
			let actionRow: ActionRowBuilder<MessageActionRowComponent> | null = null;
			if (buttonInput && buttonInput.includes(",")) {
				const [url, label] = buttonInput.split(",").map((s) => s.trim());
				if (url && label) {
					try {
						new URL(url);
						actionRow = new ActionRowBuilder<MessageActionRowComponent>().addComponents(
							new ButtonBuilder()
								.setLabel(label)
								.setStyle(ButtonStyle.Link)
								.setURL(url),
						);
					} catch (e) {
						// Ignore invalid URL
					}
				}
			}

			// Footer
			container.addComponent(
				new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large).setDivider(true),
			);
			container.addComponent(
				new TextDisplayBuilder().setContent(`-# ${getEmoji("bubble")} __@${user.username}__`),
			);

			// Create Webhook
			const guild = await fetchDiscord(`/guilds/${guildId}`, process.env.DISCORD_BOT_TOKEN!, true);
			const webhook = await fetchDiscord(
				`/channels/${channelId}/webhooks`,
				process.env.DISCORD_BOT_TOKEN!,
				true,
				"POST",
				{
					name: guild.name,
					avatar: guild.icon ? `https://cdn.discordapp.com/icons/${guildId}/${guild.icon}.png` : null,
				}
			);

			// Execute Webhook
			const webhookResponse = await fetchDiscord(
				`/webhooks/${webhook.id}/${webhook.token}?wait=true`,
				process.env.DISCORD_BOT_TOKEN!,
				true,
				"POST",
				{
					components: actionRow 
						? [container.toJSON(), actionRow.toJSON()] 
						: [container.toJSON()],
					flags: 32768
				}
			);

			// Start Thread
			await fetchDiscord(
				`/channels/${channelId}/messages/${webhookResponse.id}/threads`,
				process.env.DISCORD_BOT_TOKEN!,
				true,
				"POST",
				{
					name: title,
					auto_archive_duration: 60,
				}
			);

			// Add Reactions (using custom emojis from emojis.ts)
			const reactionPaths = [
				"reactions.user.heart",
				"reactions.user.thumbsup",
				"reactions.user.thumbsdown",
				"reactions.user.haha",
				"reactions.user.emphasize",
				"reactions.user.question",
			];

			for (const path of reactionPaths) {
				const emojiData = getEmojiData(path as any);
				const emojiParam = `${emojiData.name}:${emojiData.id}`;
				await fetchDiscord(
					`/channels/${channelId}/messages/${webhookResponse.id}/reactions/${encodeURIComponent(emojiParam)}/@me`,
					process.env.DISCORD_BOT_TOKEN!,
					true,
					"PUT"
				);
			}

			// Delete Webhook
			await fetchDiscord(
				`/webhooks/${webhook.id}/${webhook.token}`,
				process.env.DISCORD_BOT_TOKEN!,
				true,
				"DELETE"
			);

			// Clean up storage
			await db.delete(`announce_data:${userId}`);

			return interaction.editReply({
				content: `${getEmoji("seal")} Done! Announcement sent to <#${channelId}>!`,
			});

		} catch (error) {
			console.error("Error in announce modal handler:", error);
			return interaction.editReply({
				content: `${getEmoji("error")} Failed to send announcement. Please verify my permissions.`,
			});
		}
	},
};

export default announceModal;
