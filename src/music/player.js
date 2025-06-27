import { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus, getVoiceConnection, StreamType } from "@discordjs/voice";
import play from "play-dl";

const queues = new Map(); // guildId -> { connection, player, songs }

async function playNext(guildId) {
    const queue = queues.get(guildId);
    if (!queue || queue.songs.length === 0) {
        if (queue) {
            queue.connection.destroy();
            queues.delete(guildId);
        }
        return;
    }

    const song = queue.songs[0];
    try {
        let url = song.query;
        if (!play.yt_validate(url)) {
            const results = await play.search(url, { limit: 1 });
            if (!results.length || !results[0].url) {
                song.interaction.followUp({ content: `${song.emojis.error} Couldn't find song.` });
                queue.songs.shift();
                return playNext(guildId);
            }
            url = results[0].url;
        }

        const stream = await play.stream(url);
        const resource = createAudioResource(stream.stream, { inputType: stream.type ?? StreamType.Opus });
        queue.player.play(resource);
        song.interaction.followUp({ content: `${song.emojis.magic} Now playing **${stream.title ?? url}**` });
    } catch (err) {
        console.error('Play error:', err);
        song.interaction.followUp({ content: `${song.emojis.error} Could not play the requested song.` });
        queue.songs.shift();
        return playNext(guildId);
    }
}

export async function enqueue(voiceChannel, query, interaction, emojis) {
    let queue = queues.get(voiceChannel.guild.id);
    if (!queue) {
        const connection = joinVoiceChannel({
            channelId: voiceChannel.id,
            guildId: voiceChannel.guild.id,
            adapterCreator: voiceChannel.guild.voiceAdapterCreator,
        });
        const player = createAudioPlayer();
        connection.subscribe(player);
        player.on(AudioPlayerStatus.Idle, () => {
            queue.songs.shift();
            playNext(voiceChannel.guild.id);
        });
        queue = { connection, player, songs: [] };
        queues.set(voiceChannel.guild.id, queue);
    }

    queue.songs.push({ query, interaction, emojis });
    if (queue.songs.length === 1) {
        await playNext(voiceChannel.guild.id);
    } else {
        await interaction.followUp({ content: `${emojis.up} Added to queue.` });
    }
}

export function stop(guildId) {
    const queue = queues.get(guildId);
    if (queue) {
        queue.songs = [];
        queue.player.stop(true);
        queue.connection.destroy();
        queues.delete(guildId);
        return true;
    }
    return false;
}
