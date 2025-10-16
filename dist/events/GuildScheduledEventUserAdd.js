import { Events } from "discord.js";
const guildScheduledUserAddEvent = {
    name: Events.GuildScheduledEventUserAdd,
    once: false,
    execute: async (guildScheduledEvent, user) => { },
};
export default guildScheduledUserAddEvent;
