import { ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, time, MessageFlags, TextDisplayBuilder, SeparatorBuilder, SeparatorSpacingSize, } from "discord.js";
import { emojis, getEmoji, lockButtonRow, ticketContainerData } from "../../utils/export.js";
import { recordTicketResolution } from "../../utils/linkedRoleUtil.js";
const menu3 = new StringSelectMenuBuilder()
    .setCustomId("ticket-select-menu")
    .setDisabled(false)
    .setMaxValues(1)
    .setPlaceholder("Action to close ticket")
    .addOptions(new StringSelectMenuOptionBuilder()
    .setLabel("Close as completed")
    .setValue("ticket-menu-done")
    .setDescription("Done, closed, fixed, resolved")
    .setEmoji(emojis.ticket.circle.done)
    .setDefault(false), new StringSelectMenuOptionBuilder()
    .setLabel("Close as not planned")
    .setValue("ticket-menu-duplicate")
    .setDescription("Won’t fix, can’t repo, duplicate, stale")
    .setEmoji(emojis.ticket.circle.stale)
    .setDefault(false), new StringSelectMenuOptionBuilder()
    .setLabel("Close with comment")
    .setValue("ticket-menu-close")
    .setEmoji(emojis.ticket.circle.close)
    .setDefault(false));
export const row3 = new ActionRowBuilder().addComponents(menu3);
const ticketState = {
    customId: "ticket-select-menu",
    execute: async (interaction) => {
        const authorId = interaction.user.id;
        const selectedValue = interaction.values[0];
        const formattedTime = time(new Date(), "R");
        if (!interaction.channel?.isThread()) {
            throw new Error();
        }
        const member = interaction.member;
        const displayName = "displayName" in member ? member.displayName : interaction.user.username;
        switch (selectedValue) {
            case "ticket-menu-close": {
                const modal = new ModalBuilder()
                    .setCustomId("ticket-close-modal")
                    .setTitle("Close Ticket")
                    .addComponents(new ActionRowBuilder().addComponents(new TextInputBuilder()
                    .setCustomId("close-reason")
                    .setLabel("Reason for closing")
                    .setStyle(TextInputStyle.Paragraph)
                    .setRequired(true)));
                await interaction.showModal(modal);
                break;
            }
            case "ticket-menu-done": {
                const menu3 = new StringSelectMenuBuilder()
                    .setCustomId("ticket-select-menu")
                    .setDisabled(false)
                    .setMaxValues(1)
                    .setPlaceholder("What do you want to do?")
                    .addOptions(new StringSelectMenuOptionBuilder()
                    .setLabel("Close as completed")
                    .setValue("ticket-menu-done")
                    .setDescription("Done, closed, fixed, resolved")
                    .setEmoji(emojis.ticket.circle.done)
                    .setDefault(false), new StringSelectMenuOptionBuilder()
                    .setLabel("Close as not planned")
                    .setValue("ticket-menu-duplicate")
                    .setDescription("Won’t fix, can’t repo, duplicate, stale")
                    .setEmoji(emojis.ticket.circle.stale)
                    .setDefault(false), new StringSelectMenuOptionBuilder()
                    .setLabel("Close with comment")
                    .setValue("ticket-menu-close")
                    .setEmoji(emojis.ticket.circle.close));
                const row3 = new ActionRowBuilder().addComponents(menu3);
                await interaction.update({
                    components: [await ticketContainerData(interaction), row3, lockButtonRow],
                    flags: MessageFlags.IsComponentsV2,
                });
                let ticketCreatorId = null;
                try {
                    if (interaction.channel?.isThread()) {
                        const thread = interaction.channel;
                        const threadMembers = await thread.members.fetch();
                        for (const [userId, threadMember] of threadMembers) {
                            const user = threadMember.user || (await interaction.client.users.fetch(userId));
                            if (!user.bot) {
                                ticketCreatorId = userId;
                                break;
                            }
                        }
                    }
                }
                catch (error) {
                    console.warn("Could not determine ticket creator:", error);
                }
                if (ticketCreatorId && interaction.guild) {
                    try {
                        await recordTicketResolution(ticketCreatorId, interaction.guild.id, interaction.channel.id, authorId, "completed");
                    }
                    catch (error) {
                        console.error("Failed to record ticket resolution:", error);
                    }
                }
                await interaction.channel.send({
                    components: [
                        new TextDisplayBuilder().setContent(`# ${getEmoji("ticket.bubble.done")}`),
                        new TextDisplayBuilder().setContent(`-# **<@!${authorId}>** __closed__ this as completed ${formattedTime}`),
                        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true),
                    ],
                    flags: MessageFlags.IsComponentsV2,
                    allowedMentions: { parse: [] },
                });
                await interaction.channel.setLocked(true);
                await interaction.channel.setArchived(true, `${displayName} marked as completed`);
                break;
            }
            case "ticket-menu-duplicate": {
                const menu2 = new StringSelectMenuBuilder()
                    .setCustomId("ticket-select-menu")
                    .setDisabled(false)
                    .setMaxValues(1)
                    .setPlaceholder("What do you want to do?")
                    .addOptions(new StringSelectMenuOptionBuilder()
                    .setLabel("Close as completed")
                    .setValue("ticket-menu-done")
                    .setDescription("Done, closed, fixed, resolved")
                    .setEmoji(emojis.ticket.circle.done)
                    .setDefault(false), new StringSelectMenuOptionBuilder()
                    .setLabel("Close as not planned")
                    .setValue("ticket-menu-duplicate")
                    .setDescription("Won’t fix, can’t repo, duplicate, stale")
                    .setEmoji(emojis.ticket.circle.stale)
                    .setDefault(false), new StringSelectMenuOptionBuilder()
                    .setLabel("Close with comment")
                    .setValue("ticket-menu-close")
                    .setEmoji(emojis.ticket.circle.close));
                const row2 = new ActionRowBuilder().addComponents(menu2);
                await interaction.update({
                    components: [await ticketContainerData(interaction), row2, lockButtonRow],
                    flags: MessageFlags.IsComponentsV2,
                });
                let ticketCreatorId = null;
                try {
                    if (interaction.channel?.isThread()) {
                        const thread = interaction.channel;
                        const threadMembers = await thread.members.fetch();
                        for (const [userId, threadMember] of threadMembers) {
                            const user = threadMember.user || (await interaction.client.users.fetch(userId));
                            if (!user.bot) {
                                ticketCreatorId = userId;
                                break;
                            }
                        }
                    }
                }
                catch (error) {
                    console.warn("Could not determine ticket creator:", error);
                }
                if (ticketCreatorId && interaction.guild) {
                    try {
                        await recordTicketResolution(ticketCreatorId, interaction.guild.id, interaction.channel.id, authorId, "duplicate");
                        console.log(`✅ Recorded duplicate ticket resolution for user ${ticketCreatorId}`);
                    }
                    catch (error) {
                        console.error("Failed to record ticket resolution:", error);
                    }
                }
                await interaction.channel.send({
                    components: [
                        new TextDisplayBuilder().setContent(`# ${getEmoji("ticket.bubble.stale")}`),
                        new TextDisplayBuilder().setContent(`-# **<@!${authorId}>** __closed__ this as not planned ${formattedTime}`),
                        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true),
                    ],
                    flags: MessageFlags.IsComponentsV2,
                    allowedMentions: { parse: [] },
                });
                await interaction.channel.setArchived(true, `${displayName} marked as not planned`);
                break;
            }
            default:
                break;
        }
    },
};
export default ticketState;
