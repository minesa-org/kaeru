import {
	type ModalSubmitInteraction,
	InteractionFlags,
	type InteractionModal,
} from "@minesa-org/mini-interaction";
import { db } from "../../utils/database.ts";
import { getEmoji } from "../../utils/index.ts";

const announceModal: InteractionModal = {
	customId: "announce-modal",

	handler: async (interaction: ModalSubmitInteraction) => {
		const user = interaction.user;
		if (!user) return;

		const userId = user.id;
		const guildId = interaction.guild_id;
		if (!guildId) return;

		await interaction.deferReply({ flags: InteractionFlags.Ephemeral });

		const channelId = interaction.getSelectMenuValues("announcement:channel")?.[0];
		if (!channelId) {
			return interaction.editReply({
				content: `${getEmoji("error")} Please select a channel for the announcement.`,
			});
		}

		const description = interaction.getTextFieldValue("announcement:description") || "";
		const title = description.split("\n")[0]?.trim().slice(0, 100) || "Announcement";
		const buttonInput = interaction.getTextFieldValue("announcement:button");
		const rawBannerUrl = interaction.getTextFieldValue("announcement:banner_url")?.trim();
		const bannerUrl = rawBannerUrl && /^https?:\/\//i.test(rawBannerUrl)
			? rawBannerUrl
			: undefined;
		const rawRole = interaction.getTextFieldValue("announcement:role")?.trim();
		const roleId = rawRole?.match(/\d{17,20}/)?.[0];

		// queue announcement job but don't block on database
		const job = {
			guildId,
			channelId,
			title,
			description,
			bannerUrl,
			roleId,
			buttonInput,
			userId,
			username: user.username,
		};

		void (async () => {
			try {
				const existingQueue = (await db.get("announce_queue")) as any[] | null;
				const queue = existingQueue && Array.isArray(existingQueue) ? existingQueue : [];
				queue.push(job);
				await db.set("announce_queue", queue as unknown as Record<string, unknown>);
			} catch (err) {
				console.error('failed to enqueue announcement', err);
			}
		})();

		return interaction.editReply({
			content: `${getEmoji("seal")} Announcement queued – it will post shortly.`,
		});
	},
};

export default announceModal;
