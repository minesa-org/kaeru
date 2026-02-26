import { MiniDatabase } from "@minesa-org/mini-interaction";

/**
 * Shared database instance for the application.
 */
export const db = MiniDatabase.fromEnv();

/**
 * Gets user data from the database.
 */
export async function getUserData(userId: string) {
    try {
        return await db.get(userId);
    } catch (error) {
        console.error("❌ Error getting user data:", error);
        throw error;
    }
}

/**
 * Sets user's is_miniapp status.
 * Always true. No gating. Everyone connects.
 */
export async function setUserMiniAppStatus(userId: string) {
    try {
        return await db.set(userId, {
            userId,
            is_miniapp: true,
            lastUpdated: Date.now(),
        });
    } catch (error) {
        console.error("❌ Error setting user miniapp status:", error);
        throw error;
    }
}

/**
 * Updates user metadata for Discord linked roles.
 * is_miniapp is always true.
 */
export async function updateDiscordMetadata(
    userId: string,
    accessToken: string
) {
    // Optional persistence, safe even if repeated
    await setUserMiniAppStatus(userId);

    const metadata = {
        platform_name: "Mini-Interaction",
        metadata: {
            is_miniapp: 1,
        },
    };

    const response = await fetch(
        `https://discord.com/api/v10/users/@me/applications/${process.env.DISCORD_APPLICATION_ID}/role-connection`,
        {
            method: "PUT",
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(metadata),
        }
    );

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to update Discord metadata: ${error}`);
    }

    return await response.json();
}