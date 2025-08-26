import { Events } from "discord.js";
const guildScheduledUserRemoveEvent = {
    name: Events.GuildScheduledEventUserRemove,
    once: false,
    execute: async (guildScheduledEvent, user) => { },
};
export default guildScheduledUserRemoveEvent;
