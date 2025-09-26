import {
	ActivityType,
	Client,
	GatewayIntentBits,
	Partials,
	PresenceUpdateStatus,
} from "discord.js";
import { loadCommands, registerCommandsGlobally } from "../handlers/commands.js";
import { loadEvents } from "../handlers/events.js";
import { initializeMongoose } from "../database/mongoose.js";
import { log, printLogo } from "../utils/export.js";

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMembers,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.GuildScheduledEvents,
		GatewayIntentBits.GuildVoiceStates,
	],
	partials: [Partials.GuildMember, Partials.Message, Partials.Channel],
	presence: {
		status: PresenceUpdateStatus.Idle,
		// activities: [
		// 	{
		// 		name: "Unparallelled",
		// 		type: ActivityType.Custom,
		// 	},
		// ],
	},
});

setInterval(() => {
	const randomActivity = ["Unparallelled", "Free premium features"];
	const randomIndex = Math.floor(Math.random() * randomActivity.length);
	const randomName = randomActivity[randomIndex];

	client.user?.setActivity(randomName, { type: ActivityType.Custom });
}, 60000);

printLogo();

(async () => {
	try {
		await initializeMongoose();
		await loadCommands(client);
		await loadEvents(client);
		await registerCommandsGlobally(
			client,
			process.env.DISCORD_CLIENT_TOKEN!,
			process.env.DISCORD_CLIENT_ID!,
		);
	} catch (error) {
		log("error", "Failed to initialize client:", error);
	}
})();

export default client;
