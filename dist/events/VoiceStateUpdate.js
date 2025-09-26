import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, ContainerBuilder, Events, MessageFlags, PermissionFlagsBits, SectionBuilder, SeparatorBuilder, TextDisplayBuilder, ThumbnailBuilder, } from "discord.js";
import { getHubChannel } from "../utils/guildManager.js";
import { emojis, getEmoji } from "../utils/emojis.js";
const voiceStateUpdateEvent = {
    name: Events.VoiceStateUpdate,
    once: false,
    execute: async (oldState, newState) => {
        try {
            const member = newState.member;
            if (!member)
                return;
            const guild = newState.guild;
            const hubChannelId = await getHubChannel(guild.id);
            if (!hubChannelId)
                return;
            if (newState.channelId !== hubChannelId)
                return;
            if (oldState.channelId === hubChannelId)
                return;
            const botMember = guild.members.me;
            if (!botMember?.permissions.has([
                PermissionFlagsBits.ManageChannels,
                PermissionFlagsBits.MoveMembers,
            ]))
                return;
            const personalVC = await guild.channels.create({
                name: `✪ ${member.user.displayName}'s`,
                type: ChannelType.GuildVoice,
                parent: newState.channel?.parent ?? undefined,
                permissionOverwrites: [
                    {
                        id: member.id,
                        allow: [
                            PermissionFlagsBits.Connect,
                            PermissionFlagsBits.Speak,
                            PermissionFlagsBits.ManageChannels,
                            PermissionFlagsBits.PrioritySpeaker,
                            PermissionFlagsBits.DeafenMembers,
                            PermissionFlagsBits.MuteMembers,
                            PermissionFlagsBits.MoveMembers,
                        ],
                    },
                    {
                        id: guild.roles.everyone,
                        deny: [PermissionFlagsBits.Connect],
                    },
                ],
            });
            await member.voice.setChannel(personalVC);
            const container = new ContainerBuilder()
                .addTextDisplayComponents(new TextDisplayBuilder().setContent(`-# You are the operator, @${member.user.username}`))
                .addSeparatorComponents(new SeparatorBuilder().setDivider(true))
                .addSectionComponents(new SectionBuilder()
                .addTextDisplayComponents(new TextDisplayBuilder().setContent([
                `### ${getEmoji("lock_dotted")} Welcome to _superrr_ private!`,
                "This is your personal space.",
                "No one can join unless **you let them**.",
            ].join("\n")))
                .setThumbnailAccessory(new ThumbnailBuilder().setURL("https://media.discordapp.net/attachments/736571695170584576/1407074770922504332/kaeru_mic.png?ex=68a4c7ff&is=68a3767f&hm=b640ebe24d03cb43600e1122690190ccff64cd995632a534d7a0d6e098955229&=&width=614&height=610")));
            const text = new TextDisplayBuilder().setContent(`-# Feel free to unlock channel to others join`);
            const buttonRow = new ActionRowBuilder().addComponents(new ButtonBuilder()
                .setCustomId(`vc-lock-${personalVC.id}`)
                .setEmoji(emojis.lock_fill)
                .setLabel("Lock/Unlock")
                .setStyle(ButtonStyle.Secondary), new ButtonBuilder()
                .setCustomId(`vc-kick-${personalVC.id}`)
                .setEmoji(emojis.avatar)
                .setLabel("Kick Member")
                .setStyle(ButtonStyle.Secondary), new ButtonBuilder()
                .setCustomId(`vc-limit-${personalVC.id}`)
                .setEmoji(emojis.number_point)
                .setLabel("Set User Limit")
                .setStyle(ButtonStyle.Secondary));
            await personalVC.send({
                components: [container, text, buttonRow],
                flags: MessageFlags.IsComponentsV2,
            });
            const deleteChecker = async () => {
                try {
                    if (!personalVC.guild)
                        return;
                    if (personalVC.members.size === 0) {
                        await personalVC.delete().catch(() => null);
                    }
                    else {
                        setTimeout(deleteChecker, 5000);
                    }
                }
                catch (err) {
                    console.error("Delete checker error:", err);
                }
            };
            setTimeout(deleteChecker, 5000);
        }
        catch (err) {
            console.error("VoiceStateUpdate error:", err);
        }
    },
};
export default voiceStateUpdateEvent;
