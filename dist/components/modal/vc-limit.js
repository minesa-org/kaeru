import { MessageFlags, PermissionFlagsBits, } from "discord.js";
import { containerTemplate, sendAlertMessage } from "../../utils/error&containerMessage.js";
import { getEmoji } from "../../utils/emojis.js";
const vcLimitModal = {
    customId: /^vc_limit_modal_\d+$/,
    execute: async (interaction) => {
        const channelId = interaction.customId.split("_")[3];
        const channel = interaction.guild?.channels.cache.get(channelId);
        if (!channel?.isVoiceBased()) {
            return sendAlertMessage({
                interaction,
                content: `Voice channel! Where are you!?`,
                type: "error",
                tag: "whaaaaat",
            });
        }
        if (!channel.permissionsFor(interaction.user)?.has(PermissionFlagsBits.ManageChannels)) {
            return sendAlertMessage({
                interaction,
                content: "Is your name channel's name? yeah it's not.\n-# Don't do something crazy to change your name to channel's name. :D",
                type: "error",
                tag: "whaaaaat",
            });
        }
        const limitStr = interaction.fields.getTextInputValue("limit");
        const limit = parseInt(limitStr);
        if (isNaN(limit) || limit < 0 || limit > 99) {
            return sendAlertMessage({
                interaction,
                content: "Invalid. Between 1-99 or 0 for unlimited... Didn't you read placeholder?",
                type: "error",
                tag: "whaaaaat",
            });
        }
        await channel.setUserLimit(limit);
        return interaction.reply({
            components: [
                containerTemplate({
                    tag: "Voice Chat Member Limit",
                    title: `${getEmoji("number_point")} Updated user limit`,
                    description: `User limit set to ${limit === 0 ? "unlimited" : limit}.`,
                }),
            ],
            flags: [MessageFlags.Ephemeral, MessageFlags.IsComponentsV2],
        });
    },
};
export default vcLimitModal;
