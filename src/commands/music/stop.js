import {
    SlashCommandBuilder,
    ApplicationIntegrationType,
    InteractionContextType,
    MessageFlags,
} from "discord.js";
import { stop } from "../../music/player.js";
import { emojis } from "../../resources/emojis.js";

export default {
    data: new SlashCommandBuilder()
        .setName("stop")
        .setDescription("Stop the music and leave")
        .setIntegrationTypes([
            ApplicationIntegrationType.GuildInstall,
        ])
        .setContexts([InteractionContextType.Guild]),

    async execute({ interaction }) {
        const didStop = stop(interaction.guildId);
        if (!didStop) {
            return interaction.reply({
                content: `${emojis.error} Nothing is playing.`,
                flags: MessageFlags.Ephemeral,
            });
        }
        return interaction.reply({
            content: `${emojis.reactions.reaction_thumbsup} Stopped playback.`,
            flags: MessageFlags.Ephemeral,
        });
    },
};
