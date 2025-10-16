import { ActionRowBuilder, PermissionFlagsBits, StringSelectMenuOptionBuilder, StringSelectMenuBuilder, MessageFlags, } from "discord.js";
import { containerTemplate, sendAlertMessage } from "../../utils/export.js";
const ticketLockButton = {
    customId: "ticket-lock-conversation",
    execute: async (interaction) => {
        if (!interaction.guild?.members.me?.permissions.has(PermissionFlagsBits.ManageThreads)) {
            return sendAlertMessage({
                interaction,
                content: `No permission to lock. I need manage threads permission.`,
                type: "error",
                tag: "Missing Permission",
            });
        }
        const lockReasonsMenu = new ActionRowBuilder().addComponents(new StringSelectMenuBuilder()
            .setCustomId("ticket-lock-reason")
            .setDisabled(false)
            .setMaxValues(1)
            .setPlaceholder("Choose a reason")
            .addOptions(new StringSelectMenuOptionBuilder()
            .setLabel("Other")
            .setValue("ticket-lock-reason-other"), new StringSelectMenuOptionBuilder()
            .setLabel("Off-topic")
            .setValue("ticket-lock-reason-off-topic"), new StringSelectMenuOptionBuilder()
            .setLabel("Too heated")
            .setValue("ticket-lock-reason-too-heated"), new StringSelectMenuOptionBuilder()
            .setLabel("Resolved")
            .setValue("ticket-lock-reason-resolved"), new StringSelectMenuOptionBuilder().setLabel("Spam").setValue("ticket-lock-reason-spam")));
        await interaction.reply({
            components: [
                containerTemplate({
                    tag: "Locking Thread",
                    description: [
                        "* Other user(s) can’t add new comments to this ticket.",
                        "* You and other moderators with access to this channel can still leave comments that others can see.",
                        "* You can always unlock this ticket again in the future.",
                        "",
                        "-# Optionally, choose a reason for locking that others can see.",
                    ],
                    title: "Lock Conversation on This Thread",
                    thumbnail: "https://media.discordapp.net/attachments/736571695170584576/1327617955063791710/75510.png?ex=67850992&is=6783b812&hm=aeef5a062a566fa7d467752ce9f16f2a7932a655342ae048f6a1e4ef379fa10b&=&width=934&height=934",
                }),
                lockReasonsMenu,
            ],
            flags: [MessageFlags.Ephemeral, MessageFlags.IsComponentsV2],
        });
    },
};
export default ticketLockButton;
