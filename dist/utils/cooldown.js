import { ContainerBuilder, MessageFlags, TextDisplayBuilder, time, TimestampStyles, } from "discord.js";
import { getEmoji } from "./emojis.js";
const cooldowns = new Map();
/**
 * Checks cooldown for a user and command.
 * @param commandName The command's name
 * @param userId Discord user ID
 * @param durationMinutes Duration in minutes
 * @param reason Custom reason/message to display when on cooldown
 * @param interaction The interaction object (needed to reply)
 * @returns true if on cooldown (and already replied), false otherwise
 */
export async function useCooldown(commandName, userId, durationMinutes, reason, interaction) {
    if (!cooldowns.has(commandName))
        cooldowns.set(commandName, new Map());
    const commandCooldowns = cooldowns.get(commandName);
    const now = Date.now();
    const durationMs = durationMinutes * 60 * 1000;
    const lastUsed = commandCooldowns.get(userId);
    if (lastUsed && now - lastUsed < durationMs) {
        const expirationTime = Math.floor((lastUsed + durationMs) / 1000);
        const reaction = new TextDisplayBuilder().setContent(`# ${getEmoji("reactions.kaeru.emphasize")}`);
        const container = new ContainerBuilder().addTextDisplayComponents(new TextDisplayBuilder().setContent(`${reason} ${time(expirationTime, TimestampStyles.RelativeTime)}`));
        await interaction.reply({
            components: [reaction, container],
            flags: [MessageFlags.Ephemeral, MessageFlags.IsComponentsV2],
        });
        return true;
    }
    commandCooldowns.set(userId, now);
    return false;
}
