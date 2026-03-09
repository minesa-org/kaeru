import {
	type ComponentCommand,
	type ModalSubmitInteraction,
	InteractionFlags,
} from "@minesa-org/mini-interaction";
import { db } from "../../utils/database.ts";
import { getEmoji } from "../../utils/index.ts";

const announceModal: ComponentCommand = {
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
		// pull values from modal fields defined in announce.ts
		const title = interaction.getTextFieldValue("announcement:title") || "Announcement";
		const description = interaction.getTextFieldValue("announcement:description") || "";
		const buttonInput = interaction.getTextFieldValue("announcement:button");
		// file upload field returns its URL via getComponentValue
		const bannerUrl = interaction.getAttachment("announcement:attachment")?.url;
		// role select returns an array of values
		const roleId = interaction.getSelectMenuValues("announcement:role")?.[0];

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

		(async () => {
			try {
				const existingQueue = (await db.get("announce_queue")) as any[] | null;
				const queue = existingQueue && Array.isArray(existingQueue) ? existingQueue : [];
				queue.push(job);
				// MiniDatabase expects a Record<string, unknown>, so cast the array
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
