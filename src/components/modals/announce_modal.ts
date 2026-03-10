import {
	InteractionFlags,
	ContainerBuilder,
	TextDisplayBuilder,
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	GalleryBuilder,
	GalleryItemBuilder,
} from "@minesa-org/mini-interaction";
import type {
	InteractionModal,
	MessageActionRowComponent,
	ModalSubmitInteraction,
} from "@minesa-org/mini-interaction";
import { fetchDiscord } from "../../utils/discord.ts";
import { getEmoji, getEmojiData } from "../../utils/index.ts";

const reactionPaths = [
	"reactions.user.heart",
	"reactions.user.thumbsup",
	"reactions.user.thumbsdown",
	"reactions.user.haha",
	"reactions.user.emphasize",
	"reactions.user.question",
] as const;

function splitAnnouncementDescription(rawDescription: string): {
	title: string;
	body: string;
} {
	const lines = rawDescription
		.split("\n")
		.map((line) => line.trimEnd());
	const firstNonEmptyIndex = lines.findIndex((line) => line.trim().length > 0);

	if (firstNonEmptyIndex === -1) {
		return {
			title: "Announcement",
			body: "",
		};
	}

	const title = lines[firstNonEmptyIndex].trim().slice(0, 100) || "Announcement";
		const body = lines
			.slice(firstNonEmptyIndex + 1)
			.join("\n")
			.trim();

	return { title, body };
}

function parseLinkButton(input?: string): { label: string; url: string } | null {
	if (!input) return null;

	const separatorIndex = input.indexOf(",");
	if (separatorIndex === -1) return null;

	const url = input.slice(0, separatorIndex).trim();
	const label = input.slice(separatorIndex + 1).trim();

	if (!url || !label) return null;

	try {
		const parsed = new URL(url);
		if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
			return null;
		}

		return { url: parsed.toString(), label: label.slice(0, 80) };
	} catch {
		return null;
	}
}

function buildAnnouncementContainer(
	title: string,
	body: string,
	roleId?: string,
	bannerUrl?: string,
) {
	const contentLines = [`## ${getEmoji("sharedwithu")} ${title}`];

	if (roleId) {
		contentLines.push(`-# <@&${roleId}>`);
	}

	if (body) {
		contentLines.push("", body);
	}

	const container = new ContainerBuilder().addComponent(
		new TextDisplayBuilder().setContent(contentLines.join("\n")),
	);

	if (bannerUrl) {
		container.addComponent(
			new GalleryBuilder().addItem(
				new GalleryItemBuilder().setMedia({ url: bannerUrl }),
			),
		);
	}

	return container;
}

const announceModal: InteractionModal = {
	customId: "announce-modal",

	handler: async (interaction: ModalSubmitInteraction) => {
		const user = interaction.user ?? interaction.member?.user;
		if (!user) return;

		const guildId = interaction.guild_id;
		if (!guildId) return;

		console.info(
			`[Kaeru] announce-modal submitted by ${user.id} in guild ${guildId}.`,
		);

		await interaction.deferReply({ flags: InteractionFlags.Ephemeral });

		const channelId = interaction.getSelectMenuValues("announcement:channel")?.[0];
		if (!channelId) {
			return interaction.editReply({
				content: `${getEmoji("error")} Please select a channel for the announcement.`,
			});
		}

		const description = interaction.getTextFieldValue("announcement:description")?.trim() || "";
		const { title, body } = splitAnnouncementDescription(description);
		const buttonInput = interaction.getTextFieldValue("announcement:button")?.trim();
		const bannerUrl = interaction.getAttachment("announcement:banner")?.url;
		const roleId = interaction.getSelectMenuValues("announcement:role")?.[0];

		const button = parseLinkButton(buttonInput);
		if (buttonInput && !button) {
			return interaction.editReply({
				content:
					`${getEmoji("error")} Invalid button format. Use \`https://example.com, Button label\`.`,
			});
		}

		try {
			const container = buildAnnouncementContainer(
				title,
				body,
				roleId,
				bannerUrl,
			);

			const components: unknown[] = [container.toJSON()];
			if (button) {
				const actionRow = new ActionRowBuilder<MessageActionRowComponent>().addComponents(
					new ButtonBuilder()
						.setLabel(button.label)
						.setStyle(ButtonStyle.Link)
						.setURL(button.url),
				);
				components.push(actionRow.toJSON());
			}

			const message = await fetchDiscord(
				`/channels/${channelId}/messages`,
				process.env.DISCORD_BOT_TOKEN!,
				true,
				"POST",
				{
					components,
					flags: [InteractionFlags.IsComponentsV2, 32768].reduce(
						(acc, flag) => acc | flag,
						0,
					),
				},
			);

			console.info(
				`[Kaeru] Sent announcement message ${message.id} to channel ${channelId}.`,
			);

			const reactionResults = await Promise.allSettled(
				reactionPaths.map((path) => {
					const emoji = getEmojiData(path);
					return fetchDiscord(
						`/channels/${channelId}/messages/${message.id}/reactions/${encodeURIComponent(`${emoji.name}:${emoji.id}`)}/@me`,
						process.env.DISCORD_BOT_TOKEN!,
						true,
						"PUT",
					);
				}),
			);

			const failedReactionPaths = reactionResults.flatMap((result, index) =>
				result.status === "rejected" ? [reactionPaths[index]] : [],
			);

			if (failedReactionPaths.length > 0) {
				console.warn(
					`[Kaeru] Failed to add ${failedReactionPaths.length} reaction(s) to announcement message ${message.id}: ${failedReactionPaths.join(", ")}.`,
				);
			}

			const threadName =
				title.length > 0 ? title.slice(0, 100) : `Announcement by ${user.username}`;

			const thread = await fetchDiscord(
				`/channels/${channelId}/messages/${message.id}/threads`,
				process.env.DISCORD_BOT_TOKEN!,
				true,
				"POST",
				{
					name: threadName,
					auto_archive_duration: 1440,
				},
			);

			console.info(
				`[Kaeru] Created announcement thread ${thread.id} in channel ${channelId}.`,
			);

			return interaction.editReply({
				content:
					`${getEmoji("seal")} Announcement sent to <#${channelId}> and thread <#${thread.id}> was created.`,
			});
		} catch (error) {
			console.error("Error in announce modal handler:", error);
			return interaction.editReply({
				content:
					`${getEmoji("error")} Failed to send the announcement or create its public thread. Check my permissions in <#${channelId}>.`,
			});
		}
	},
};

export default announceModal;
