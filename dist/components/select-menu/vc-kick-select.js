import { PermissionFlagsBits, MessageFlags, } from "discord.js";
import { containerTemplate, sendAlertMessage } from "../../utils/error&containerMessage.js";
const vcKickSelect = {
    customId: "vc_kick_select",
    execute: async (interaction) => {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });
        const member = interaction.member;
        const channel = member.voice.channel;
        if (!channel) {
            return sendAlertMessage({
                interaction,
                content: `Voice channel! Where are you!?`,
                type: "error",
                tag: "whaaaaat",
            });
        }
        if (!interaction.guild?.members.me?.permissions.has(PermissionFlagsBits.ManageChannels)) {
            return sendAlertMessage({
                interaction,
                content: `No permission, give me permission. (Manage Channels)`,
                type: "error",
                tag: "Missing Permission",
            });
        }
        const kickedMembers = [];
        for (const userId of interaction.values) {
            try {
                const target = await interaction.guild.members.fetch(userId);
                if (!target || target.voice.channelId !== channel.id)
                    continue;
                await target.voice.setChannel(null);
                await channel.permissionOverwrites.edit(target, {
                    Connect: false,
                });
                kickedMembers.push(target.displayName);
            }
            catch (err) {
                console.error(`Failed to kick/blacklist ${userId}:`, err);
            }
        }
        await interaction.editReply({
            components: [
                containerTemplate({
                    tag: "Kicked && Blacklisted",
                    description: kickedMembers.length > 0
                        ? [`# Bye bye...`, `- ${kickedMembers.join("\n- ")}`]
                        : [
                            `# No members were kicked`,
                            `Did you just try to kick someone not in the channel?`,
                        ],
                }),
            ],
            flags: MessageFlags.IsComponentsV2,
        });
    },
};
export default vcKickSelect;
