import { ContainerBuilder, Events, MessageFlags, SectionBuilder, TextDisplayBuilder, ThumbnailBuilder, } from "discord.js";
import { EmojiSize, getEmojiURL, getEmoji } from "../utils/export.js";
const guildMemberAddEvent = {
    name: Events.GuildMemberAdd,
    once: false,
    execute: async (member) => {
        const guild = member.guild;
        const accountAge = Date.now() - member.user.createdTimestamp;
        const oneWeek = 1000 * 60 * 60 * 24 * 7;
        if (accountAge < oneWeek) {
            const timeoutReason = "Account is younger than 7 days.";
            const timeoutDuration = new Date(Date.now() + oneWeek);
            // DM the user (if possible)
            await member
                .send({
                components: [
                    new ContainerBuilder().addSectionComponents(new SectionBuilder()
                        .addTextDisplayComponents(new TextDisplayBuilder().setContent([
                        `# Time-outed!`,
                        `You might be questioning why you're timeouted...\nWell, since your account is younger than 7 days, I have restricted you temporarily.`,
                        `-# Server: ${guild.name}`,
                    ].join("\n")))
                        .setThumbnailAccessory(new ThumbnailBuilder().setURL(getEmojiURL(getEmoji("timeout"), EmojiSize.Large)))),
                ],
                flags: MessageFlags.IsComponentsV2,
            })
                .catch(() => { });
            // Timeout the user
            await member.disableCommunicationUntil(timeoutDuration, timeoutReason).catch(console.error);
            const container = new ContainerBuilder().addSectionComponents(new SectionBuilder()
                .addTextDisplayComponents(new TextDisplayBuilder().setContent([
                `${getEmoji("timeout")} Time-outed a new account`,
                `User <@${member.user.id}> (${member.user.username}) has joined the server.\nTheir account is younger than 7 days, so they have been timeouted for one week.`,
            ].join("\n")))
                .setThumbnailAccessory(new ThumbnailBuilder().setURL(member.user.displayAvatarURL())));
            if (guild.systemChannel?.isTextBased() && guild.systemChannel.viewable) {
                await guild.systemChannel
                    .send({ components: [container], flags: MessageFlags.IsComponentsV2 })
                    .catch(console.error);
            }
        }
    },
};
export default guildMemberAddEvent;
