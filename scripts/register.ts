import "dotenv/config";
import { mini } from "../api/interactions";
import {
	registerDiscordRoleConnectionMetadata,
	ROLE_CONNECTION_METADATA,
} from "../src/utils/discordRoleMetadata.js";

if (!process.env.DISCORD_BOT_TOKEN) {
	console.log("⚠️ DISCORD_BOT_TOKEN not found. Skipping command registration.");
	process.exit(0);
}

await mini.registerCommands(process.env.DISCORD_BOT_TOKEN!);

if (typeof (mini as { registerMetadata?: unknown }).registerMetadata === "function") {
	await (
		mini as {
			registerMetadata: (
				botToken: string,
				metadata: typeof ROLE_CONNECTION_METADATA
			) => Promise<unknown>;
		}
	).registerMetadata(process.env.DISCORD_BOT_TOKEN!, ROLE_CONNECTION_METADATA);
} else {
	await registerDiscordRoleConnectionMetadata(process.env.DISCORD_BOT_TOKEN!);
}

console.log("Registration complete!");
