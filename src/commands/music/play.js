import {
    SlashCommandBuilder,
    ApplicationIntegrationType,
    InteractionContextType,
    MessageFlags,
} from "discord.js";
import { enqueue } from "../../music/player.js";
import { emojis } from "../../resources/emojis.js";

export default {
    data: new SlashCommandBuilder()
        .setName("play")
        .setDescription("Play music in your voice channel")
        .setIntegrationTypes([
            ApplicationIntegrationType.GuildInstall,
        ])
        .setContexts([InteractionContextType.Guild])
        .addStringOption(opt =>
            opt
                .setName("query")
                .setDescription("Song name or URL")
                .setRequired(true)
        ),

    async execute({ interaction }) {
        const member = interaction.member;
        const voiceChannel = member?.voice?.channel;
        if (!voiceChannel) {
            return interaction.reply({
                content: `${emojis.error} You must be in a voice channel.`,
                flags: MessageFlags.Ephemeral,
            });
        }

        await interaction.deferReply();
        const query = interaction.options.getString("query");
        await enqueue(voiceChannel, query, interaction, emojis);
    },
};
