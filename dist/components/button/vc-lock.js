import { MessageFlags, PermissionFlagsBits } from "discord.js";
import { containerTemplate, sendAlertMessage } from "../../utils/error&containerMessage.js";
import { getEmoji } from "../../utils/emojis.js";
const vcLock = {
    customId: /^vc-lock-\d+$/,
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
        const everyoneRole = interaction.guild.roles.everyone;
        const currentPerms = channel.permissionOverwrites.cache.get(everyoneRole.id);
        const isLocked = currentPerms?.deny.has(PermissionFlagsBits.Connect);
        await channel.permissionOverwrites.edit(everyoneRole, {
            Connect: isLocked ? null : false,
        });
        await interaction.reply({
            components: [
                containerTemplate({
                    tag: "Lock Voice Chat",
                    description: `# ${isLocked ? getEmoji("ticket.bubble.key") : getEmoji("ticket.bubble.lock")}\n### Channel ${isLocked ? "unlocked" : "locked"}.`,
                }),
            ],
            flags: [MessageFlags.Ephemeral, MessageFlags.IsComponentsV2],
        });
    },
};
export default vcLock;
