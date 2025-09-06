import { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, PermissionFlagsBits, } from "discord.js";
import { sendAlertMessage } from "../../utils/error&containerMessage.js";
const vcLimit = {
    customId: /^vc-limit-\d+$/,
    execute: async (interaction) => {
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
        const modal = new ModalBuilder()
            .setCustomId(`vc_limit_modal_${channelId}`)
            .setTitle("Set User Limit");
        const limitInput = new TextInputBuilder()
            .setCustomId("limit")
            .setLabel("✦ Please enter user limit")
            .setPlaceholder("Between 1-99, 0 for unlimited")
            .setStyle(TextInputStyle.Short)
            .setMinLength(1)
            .setMaxLength(2)
            .setRequired(true);
        const row = new ActionRowBuilder().addComponents(limitInput);
        modal.addComponents(row);
        await interaction.showModal(modal);
    },
};
export default vcLimit;
