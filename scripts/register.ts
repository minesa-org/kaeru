import "dotenv/config";
import { mini } from "../api/interactions";
import { ROLE_CONNECTION_METADATA } from "../src/utils/discordRoleMetadata.js";

if (!process.env.DISCORD_BOT_TOKEN) {
	console.log("⚠️ DISCORD_BOT_TOKEN not found. Skipping command registration.");
	process.exit(0);
}

await mini.registerCommands(process.env.DISCORD_BOT_TOKEN!);
await mini.registerMetadata(process.env.DISCORD_BOT_TOKEN!, ROLE_CONNECTION_METADATA);

console.log("Registration complete!");
