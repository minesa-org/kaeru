import { Guild } from "../database/schemas/guild.model.js";
/**
 * Save the logging channel ID for a guild
 * @param guildId The guild ID
 * @param channelId The channel ID
 */
export async function setupLoggingChannel(guildId, channelId) {
    await Guild.findOneAndUpdate({ guildId }, { loggingChannelId: channelId }, { upsert: true });
}
/**
 * Get the logging channel ID for a guild
 * @param guildId The guild ID
 * @returns The channel ID
 */
export async function checkLoggingChannel(guildId) {
    const guild = await Guild.findOne({ guildId });
    return guild?.loggingChannelId ?? null;
}
