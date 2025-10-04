import { time, MessageFlags, PermissionFlagsBits } from "discord.js";
import { containerTemplate, getEmoji, sendAlertMessage } from "../../utils/export.js";
const createTicketModal = {
    customId: "ticket-close-modal",
    execute: async (interaction) => {
        if (!interaction.guild?.members.me?.permissions.has(PermissionFlagsBits.ManageThreads)) {
            return sendAlertMessage({
                interaction,
                content: `I cannot manage threads aka no closing.`,
                type: "error",
                tag: "Missing Permission",
                alertReaction: "danger",
            });
        }
        await interaction.deferReply();
        const closeReason = interaction.fields.getTextInputValue("close-reason");
        const formattedTime = time(new Date(), "R");
        await interaction.editReply({
            components: [
                containerTemplate({
                    tag: "Thread Force Closing",
                    description: [
                        `-# **<@!${interaction.user.id}>** has __force closed__ the thread as completed ${formattedTime}`,
                        ``,
                        `### Comment`,
                        `>>> ${closeReason}`,
                    ],
                    title: getEmoji("ticket.bubble.close"),
                    thumbnail: "https://media.discordapp.net/attachments/736571695170584576/1408590769131884545/Normal.png?ex=68aa4be1&is=68a8fa61&hm=85d00101cde9570ac49dbdf944b102464128eca503e8156349787f5b158f56ab&=&format=webp&quality=lossless&width=706&height=706",
                }),
            ],
            flags: MessageFlags.IsComponentsV2,
            allowedMentions: {
                parse: [],
            },
        });
        if (!interaction.channel?.isThread()) {
            throw new Error(); // For condition
        }
        await interaction.channel.setLocked(true);
        await interaction.channel.setArchived(true, `${interaction.user.username} marked the ticket as completed with reason: ${closeReason}`);
    },
};
export default createTicketModal;
