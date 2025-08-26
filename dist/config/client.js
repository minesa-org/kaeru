import { ActivityType, Client, GatewayIntentBits, Partials, PresenceUpdateStatus, } from "discord.js";
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
        activities: [
            {
                name: "Pro & A.I. features for free",
                type: ActivityType.Watching,
                state: "Serving free pro features for your community.",
            },
        ],
    },
});
printLogo();
(async () => {
    try {
        await initializeMongoose();
        await loadCommands(client);
        await loadEvents(client);
        await registerCommandsGlobally(client, process.env.DISCORD_CLIENT_TOKEN, process.env.DISCORD_CLIENT_ID);
    }
    catch (error) {
        log("error", "Failed to initialize client:", error);
    }
})();
export default client;
