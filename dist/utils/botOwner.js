/**
 * Bot owner utility functions
 */
/**
 * Checks if a user is the bot owner
 * @param userId Discord user ID to check
 * @returns true if user is the bot owner, false otherwise
 */
export function isBotOwner(userId) {
    const botOwnerId = process.env.BOT_OWNER_ID;
    if (!botOwnerId) {
        console.warn("BOT_OWNER_ID environment variable is not set");
        return false;
    }
    return userId === botOwnerId;
}
/**
 * Gets the bot owner ID from environment variables
 * @returns Bot owner ID or null if not set
 */
export function getBotOwnerId() {
    return process.env.BOT_OWNER_ID || null;
}
