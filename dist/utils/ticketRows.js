import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import { emojis } from "../utils/emojis.js";
const lockButton = new ButtonBuilder()
    .setCustomId("ticket-lock-conversation")
    .setLabel("Lock Ticket")
    .setStyle(ButtonStyle.Secondary)
    .setDisabled(false)
    .setEmoji(emojis.ticket.bubble.lock);
const karuButton = new ButtonBuilder()
    .setCustomId("ticket-karu-button")
    .setLabel("Kāru AI (Beta)")
    .setStyle(ButtonStyle.Secondary)
    .setDisabled(false)
    .setEmoji(emojis.intelligence);
const lockButtonRow = new ActionRowBuilder().addComponents(lockButton, karuButton);
export { lockButtonRow };
