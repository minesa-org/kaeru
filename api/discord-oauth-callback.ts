import { MiniDatabase } from "@minesa-org/mini-interaction";
import { mini } from "./interactions.js";
import { updateDiscordMetadata } from "../src/utils/database.js";

const database = MiniDatabase.fromEnv();
const failedPage = mini.failedOAuthPage("public/pages/failed.html");

export default mini.discordOAuthCallback({
    templates: {
        success: mini.connectedOAuthPage("public/pages/connected.html"),
        missingCode: failedPage,
        oauthError: failedPage,
        invalidState: failedPage,
        serverError: failedPage,
    },
    async onAuthorize({ user, tokens }: { user: any; tokens: any }) {
        await database.set(user.id, {
            accessToken: tokens.access_token,
            refreshToken: tokens.refresh_token,
            expiresAt: tokens.expires_at,
            scope: tokens.scope,
        });

        await updateDiscordMetadata(user.id, tokens.access_token);
    },
});