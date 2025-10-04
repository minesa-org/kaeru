import { Guild } from "../models/guild.model.js";
/**
 * Sets the hub voice channel for a guild.
 * If the guild does not exist in the database, it will be created.
 *
 * @param {string} guildId - The ID of the guild.
 * @param {string} channelId - The ID of the channel to set as the hub.
 * @returns {Promise<import("../models/guild.model.js").IGuild>} The updated or newly created guild document.
 */
async function setHubChannel(guildId, channelId) {
    let guild = await Guild.findOne({ guildId });
    if (!guild) {
        guild = new Guild({ guildId, hubChannelId: channelId });
    }
    else {
        guild.hubChannelId = channelId;
    }
    await guild.save();
    return guild;
}
/**
 * Retrieves the hub voice channel ID for a guild.
 *
 * @param {string} guildId - The ID of the guild.
 * @returns {Promise<string | null>} The hub channel ID, or null if not set.
 */
async function getHubChannel(guildId) {
    const guild = await Guild.findOne({ guildId });
    return guild?.hubChannelId || null;
}
/**
 * Saves the logging channel ID for a guild.
 *
 * @param {string} guildId - The guild ID.
 * @param {string} channelId - The channel ID to save as logging channel.
 * @returns {Promise<void>} Resolves when the operation is complete.
 */
async function setupLoggingChannel(guildId, channelId) {
    await Guild.findOneAndUpdate({ guildId }, { loggingChannelId: channelId }, { upsert: true });
}
/**
 * Retrieves the logging channel ID for a guild.
 *
 * @param {string} guildId - The guild ID.
 * @returns {Promise<string | null>} The channel ID, or null if not set.
 */
async function checkLoggingChannel(guildId) {
    const guild = await Guild.findOne({ guildId });
    return guild?.loggingChannelId ?? null;
}
/**
 * Saves the staff role ID for a guild.
 *
 * @param {string} guildId - The guild ID.
 * @param {string} roleId - The role ID to save.
 * @returns {Promise<void>} Resolves when the operation is complete.
 */
async function saveStaffRoleId(guildId, roleId) {
    await Guild.findOneAndUpdate({ guildId }, { staffRoleId: roleId }, { upsert: true });
}
/**
 * Retrieves the staff role ID for a guild.
 *
 * @param {string} guildId - The guild ID.
 * @returns {Promise<string | null>} The role ID, or null if not set.
 */
async function getStaffRoleId(guildId) {
    const guild = await Guild.findOne({ guildId });
    return guild?.staffRoleId ?? null;
}
/**
 * Adds a warning to a user in the guild.
 *
 * @param {string} guildId - The guild ID.
 * @param {string} userId - The user ID.
 * @returns {Promise<number>} The total number of warnings the user has after increment.
 */
async function addWarning(guildId, userId) {
    const update = { $inc: { [`warnings.${userId}`]: 1 } };
    const guild = await Guild.findOneAndUpdate({ guildId }, update, {
        upsert: true,
        new: true,
    });
    return guild?.warnings.get(userId) ?? 0;
}
/**
 * Retrieves the number of warnings a user has in the guild.
 *
 * @param {string} guildId - The guild ID.
 * @param {string} userId - The user ID.
 * @returns {Promise<number>} The number of warnings, or 0 if none.
 */
async function checkWarnings(guildId, userId) {
    try {
        const guild = await Guild.findOne({ guildId });
        if (!guild || !guild.warnings)
            return 0;
        return guild.warnings.get(userId) ?? 0;
    }
    catch (error) {
        console.error("Error checking warnings:", error);
        return 0;
    }
}
/**
 * Sets the image channel for a guild.
 * If the guild does not exist in the database, it will be created.
 *
 * @param {string} guildId - The guild ID.
 * @param {string} channelId - The image channel ID.
 * @returns {Promise<import("../models/guild.model.js").IGuild>} The updated or newly created guild document.
 */
async function setImageChannel(guildId, channelId) {
    const guild = await Guild.findOneAndUpdate({ guildId }, { "imageChannel.channelId": channelId }, { upsert: true, new: true });
    return guild;
}
/**
 * Retrieves the image channel ID for a guild.
 *
 * @param {string} guildId - The guild ID.
 * @returns {Promise<string | null>} The image channel ID, or null if not set.
 */
async function getImageChannel(guildId) {
    const guild = await Guild.findOne({ guildId });
    return guild?.imageChannel?.channelId ?? null;
}
/**
 * Increases post count of image channel.
 *
 * @param {string} guildId - The guild ID.
 * @returns {Promise<string | null>} The post number.
 */
async function incrementPostCount(guildId) {
    const guild = await Guild.findOneAndUpdate({ guildId }, { $inc: { "imageChannel.postCount": 1 } }, { new: true, upsert: true });
    return guild?.imageChannel?.postCount ?? 0;
}
export { addWarning, checkLoggingChannel, checkWarnings, getHubChannel, getImageChannel, getStaffRoleId, incrementPostCount, saveStaffRoleId, setHubChannel, setImageChannel, setupLoggingChannel, };
