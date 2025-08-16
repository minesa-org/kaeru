import { Guild } from "../database/schemas/guild.model.js";
/**
 * Add a warning to a user
 * @param guildId The guild ID
 * @param userId The user ID
 * @returns The number of warnings the user has
 */
export async function addWarning(guildId, userId) {
    const update = { $inc: { [`warnings.${userId}`]: 1 } };
    const guild = await Guild.findOneAndUpdate({ guildId }, update, {
        upsert: true,
        new: true,
    });
    return guild?.warnings.get(userId) ?? 0;
}
/**
 * Check the number of warnings a user has
 * @param guildId The guild ID
 * @param userId The user ID
 * @returns The number of warnings the user has
 */
export async function checkWarnings(guildId, userId) {
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
