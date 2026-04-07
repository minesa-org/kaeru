import "dotenv/config";
import { RoleConnectionMetadataTypes, type RoleConnectionMetadataInput } from "@minesa-org/mini-interaction";
import { mini } from "../api/interactions";

const ROLE_CONNECTION_METADATA: RoleConnectionMetadataInput[] = [
	{
		key: "github_org_member",
		name: "GitHub Org Member",
		description: "User is a member of the configured GitHub organization.",
		type: RoleConnectionMetadataTypes.IntegerGreaterThanOrEqual,
		name_localizations: {
			tr: "GitHub Organizasyon Uyesi",
		},
		description_localizations: {
			tr: "Kullanici ayarlanan GitHub organizasyonunun bir uyesidir.",
		},
	},
];

if (!process.env.DISCORD_BOT_TOKEN) {
	console.log("⚠️ DISCORD_BOT_TOKEN not found. Skipping command registration.");
	process.exit(0);
}

await mini.registerCommands(process.env.DISCORD_BOT_TOKEN!);
await mini.registerMetadata(process.env.DISCORD_BOT_TOKEN!, ROLE_CONNECTION_METADATA);

console.log("Registration complete!");
