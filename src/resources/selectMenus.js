import {
	ActionRowBuilder,
	StringSelectMenuBuilder,
	StringSelectMenuOptionBuilder,
} from "discord.js";
import { emojis } from "./emojis.js";

let ticketMenu = new StringSelectMenuBuilder()
	.setCustomId("ticket-select-menu")
	.setDisabled(false)
	.setMaxValues(1)
	.setPlaceholder("Action to close ticket")
	.addOptions(
		new StringSelectMenuOptionBuilder()
			.setLabel("Close as completed")
			.setValue("ticket-menu-done")
			.setDescription("Done, closed, fixed, resolved")
			.setEmoji(emojis.ticket.circle.done)
			.setDefault(false),
		new StringSelectMenuOptionBuilder()
			.setLabel("Close as not planned")
			.setValue("ticket-menu-duplicate")
			.setDescription("Won’t fix, can’t repo, duplicate, stale")
			.setEmoji(emojis.ticket.circle.stale)
			.setDefault(false),
		new StringSelectMenuOptionBuilder()
			.setLabel("Close with comment")
			.setValue("ticket-menu-close")
			.setEmoji(emojis.ticket.circle.close)
			.setDefault(false),
	);

let labelMenu = new StringSelectMenuBuilder()
	.setCustomId("ticket-label-menu")
	.setPlaceholder("Select a label for this ticket")
	.setMinValues(1)
	.addOptions(
		new StringSelectMenuOptionBuilder()
			.setLabel("Bug")
			.setValue("label-bug")
			.setEmoji(emojis.ticket.label.bug),
		new StringSelectMenuOptionBuilder()
			.setLabel("Reward")
			.setValue("label-reward")
			.setEmoji(emojis.ticket.label.reward),
		new StringSelectMenuOptionBuilder()
			.setLabel("Question")
			.setValue("label-question")
			.setEmoji(emojis.ticket.label.question),
		new StringSelectMenuOptionBuilder()
			.setLabel("Discussion")
			.setValue("label-discussion")
			.setEmoji(emojis.ticket.label.discussion),
		new StringSelectMenuOptionBuilder()
			.setLabel("Help")
			.setValue("label-help")
			.setEmoji(emojis.ticket.label.help),
	);

const ticketMenuRow = new ActionRowBuilder().addComponents(ticketMenu);
const labelMenuRow = new ActionRowBuilder().addComponents(labelMenu);

export { ticketMenuRow, labelMenuRow };
