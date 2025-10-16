import "dotenv/config";
import client from "./config/client.js";
import { log } from "./utils/export.js";
async function startBot() {
    try {
        await client.login(process.env.DISCORD_CLIENT_TOKEN);
    }
    catch (error) {
        log("error", "Failed to login:", error);
        process.exit(1);
    }
}
startBot();
