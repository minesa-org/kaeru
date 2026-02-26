
import { mini } from "../api/interactions";

if (!process.env.DISCORD_BOT_TOKEN) {
    console.log("⚠️ DISCORD_BOT_TOKEN not found. Skipping command registration.");
    process.exit(0);
}

await mini.registerCommands(process.env.DISCORD_BOT_TOKEN!);

console.log("Registration complete!");