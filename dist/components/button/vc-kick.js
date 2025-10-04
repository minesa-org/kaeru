import { ActionRowBuilder, UserSelectMenuBuilder, PermissionFlagsBits, MessageFlags, } from "discord.js";
import { containerTemplate, sendAlertMessage } from "../../utils/error&containerMessage.js";
export const vcKickButton = {
    customId: /^vc-kick-\d+$/,
    execute: async (interaction) => {
        try {
            const channelId = interaction.customId.split("-")[2];
            const channel = interaction.guild?.channels.cache.get(channelId);
            if (!channel?.isVoiceBased()) {
                return sendAlertMessage({
                    interaction,
                    content: `Voice channel is not found, impossible!`,
                    type: "error",
                    tag: "What the fuck?",
                });
            }
            if (!channel.permissionsFor(interaction.user)?.has(PermissionFlagsBits.ManageChannels)) {
                return sendAlertMessage({
                    interaction,
                    content: "Is your name channel's name? yeah it's not.\n-# Don't do something crazy to change your name to channel's name. :D",
                    type: "error",
                    tag: "Missing Permission",
                    alertReaction: "reactions.kaeru.question",
                });
            }
            const members = Array.from(channel.members.values());
            if (members.length === 0 || members.length === 1) {
                return sendAlertMessage({
                    interaction,
                    content: "Umm... are you trying to... kick Natalia, lol\n> Nice one asdkalsjd, Natalia from MLBB haha",
                    alertReaction: "reactions.kaeru.haha",
                    type: "error",
                    tag: "Missing Permission",
                });
            }
            const selectMenu = new UserSelectMenuBuilder()
                .setCustomId(`vc_kick_select`)
                .setPlaceholder("Select members to kick")
                .setMinValues(1)
                .setMaxValues(Math.min(members.length, 25));
            const row = new ActionRowBuilder().addComponents(selectMenu);
            const container = containerTemplate({
                tag: "Kicking Member Out of Channel",
                description: "Select members from menu to **kick** and **blacklist** for this private chat",
                thumbnail: "https://media.discordapp.net/attachments/736571695170584576/1407092130215887040/Frame_15.png?ex=68a4d82a&is=68a386aa&hm=2ea7073543f643e9ce96fd6a54bd9b5bc9005234fe76fbf09fbf4d759fb7a15c&=&width=614&height=610",
            });
            return interaction.reply({
                components: [container, row],
                flags: [MessageFlags.Ephemeral, MessageFlags.IsComponentsV2],
            });
        }
        catch (err) {
            console.error("vcKickButton error:", err);
            return sendAlertMessage({ interaction, content: "An error occured." });
        }
    },
};
export default vcKickButton;
