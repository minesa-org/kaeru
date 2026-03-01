import {
	type ComponentCommand,
	type ModalSubmitInteraction,
	InteractionFlags,
} from "@minesa-org/mini-interaction";
import { db } from "../../utils/database.ts";
import { getEmoji, getEmojiData } from "../../utils/index.ts";

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
		// pull values from modal fields defined in announce.ts
		const title = interaction.getTextFieldValue("announcement:title") || "Announcement";
		const description = interaction.getTextFieldValue("announcement:description") || "";
		const buttonInput = interaction.getTextFieldValue("announcement:button");
		// file upload field returns its URL via getComponentValue
		const bannerUrl = interaction.getComponentValue("announcement:attachment") as string | undefined;
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
				// remove temporary data
				await db.delete(`announce_data:${userId}`);
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
