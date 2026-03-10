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
import { getEmoji } from "../../utils/index.ts";

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
	description: string,
	roleId?: string,
	bannerUrl?: string,
) {
	const container = new ContainerBuilder().addComponent(
		new TextDisplayBuilder().setContent(
			[
				`## ${getEmoji("sharedwithu")} ${title}`,
				roleId ? `-# <@&${roleId}>` : null,
				"",
				description,
			]
				.filter((line) => line !== null)
				.join("\n"),
		),
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
		const user = interaction.user;
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
		const title = description.split("\n")[0]?.trim().slice(0, 100) || "Announcement";
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
				description,
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
