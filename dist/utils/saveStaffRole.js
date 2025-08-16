import { Guild } from "../database/schemas/guild.model.js";
/**
 * Save the staff role ID for a guild
 * @param guildId The guild ID
 * @param roleId The role ID
 */
export async function saveStaffRoleId(guildId, roleId) {
    await Guild.findOneAndUpdate({ guildId }, { staffRoleId: roleId }, { upsert: true });
}
/**
 * Get the staff role ID for a guild
 * @param guildId The guild ID
 * @returns The role ID
 */
export async function getStaffRoleId(guildId) {
    const guild = await Guild.findOne({ guildId });
    return guild?.staffRoleId ?? null;
}
