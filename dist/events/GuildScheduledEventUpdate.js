import { Events } from "discord.js";
const guildScheduledUpdateEvent = {
    name: Events.GuildScheduledEventUpdate,
    once: false,
    execute: async (oldGuildScheduledEvent, newGuildScheduledEvent) => {
        // Checking if the event was initiated by the bot
        if (newGuildScheduledEvent.guild?.client.user.id === process.env.DISCORD_CLIENT_ID)
            return;
    },
};
export default guildScheduledUpdateEvent;
