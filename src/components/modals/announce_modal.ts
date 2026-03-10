import {
	type ModalSubmitInteraction,
	InteractionFlags,
	type InteractionModal,
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

const announceModal: InteractionModal = {
	customId: "announce-modal",

	handler: async (interaction: ModalSubmitInteraction) => {
		const user = interaction.user;
		if (!user) return;

		const guildId = interaction.guild_id;
		if (!guildId) return;

		const channelId = interaction.getSelectMenuValues("announcement:channel")?.[0];
		if (!channelId) {
			return interaction.reply({
				content: `${getEmoji("error")} Please select a channel for the announcement.`,
				flags: InteractionFlags.Ephemeral,
			});
		}

		const description = interaction.getTextFieldValue("announcement:description")?.trim() || "";
		const title = description.split("\n")[0]?.trim().slice(0, 100) || "Announcement";
		const buttonInput = interaction.getTextFieldValue("announcement:button");
		const rawBannerUrl = interaction.getTextFieldValue("announcement:banner_url")?.trim();
		const bannerUrl = rawBannerUrl && /^https?:\/\//i.test(rawBannerUrl)
			? rawBannerUrl
			: undefined;
		const rawRole = interaction.getTextFieldValue("announcement:role")?.trim();
		const roleId = rawRole?.match(/\d{17,20}/)?.[0];

		const button = parseLinkButton(buttonInput ?? undefined);
		if (buttonInput && !button) {
			return interaction.reply({
				content:
					`${getEmoji("error")} Invalid button format. Use \`https://example.com, Button label\`.`,
				flags: InteractionFlags.Ephemeral,
			});
		}

		interaction.deferReply({ flags: InteractionFlags.Ephemeral });

		const messagePayload: Record<string, unknown> = {
			content: roleId ? `<@&${roleId}>` : undefined,
			embeds: [
				{
					title,
					description,
					image: bannerUrl ? { url: bannerUrl } : undefined,
					footer: {
						text: `Sent by ${user.username}`,
					},
				},
			],
			allowed_mentions: roleId ? { roles: [roleId] } : undefined,
			components: button
				? [
						{
							type: 1,
							components: [
								{
									type: 2,
									style: 5,
									label: button.label,
									url: button.url,
								},
							],
						},
				  ]
				: undefined,
		};

		try {
			await fetchDiscord(
				`/channels/${channelId}/messages`,
				process.env.DISCORD_BOT_TOKEN!,
				true,
				"POST",
				messagePayload,
				5000,
			);
		} catch (error) {
			console.error("Failed to send announcement:", error);
			return interaction.editReply({
				content:
					`${getEmoji("error")} Failed to send the announcement. Check channel permissions and input values.`,
			});
		}

		return interaction.editReply({
			content:
				`${getEmoji("seal")} Announcement sent to <#${channelId}> by ${user.username}.`,
		});
	},
};

export default announceModal;
