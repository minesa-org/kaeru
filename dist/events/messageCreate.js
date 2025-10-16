import { Events, TextChannel } from "discord.js";
import MessageModel from "../models/message.model.js";
import { karu } from "../config/karu.js";
import { getMongooseConnection } from "../database/mongoose.js";
import { log, handleKaruMessage, getImageChannel, incrementPostCount, getEmoji, } from "../utils/export.js";
const IMAGE_EXTENSIONS = /\.(png|jpe?g|gif|webp|mp4|webm|mov)$/i;
const DISCORD_MEDIA_REGEX = /(https?:\/\/)?(media\.discordapp\.net|cdn\.discordapp\.com|discord\.com\/attachments)/i;
const messageCreateEvent = {
    name: Events.MessageCreate,
    once: false,
    async execute(message) {
        if (!message.guild)
            return;
        if (message.author.bot)
            return;
        if (!message.guild.members.me?.permissions.has("CreatePrivateThreads"))
            return;
        // ------------------ IMAGE CHANNEL MEDIA GUARD ------------------ //
        const imageChannelId = await getImageChannel(message.guild.id);
        const targetChannel = imageChannelId
            ? message.guild.channels.cache.get(imageChannelId)
            : null;
        const isInImageChannel = message.channel.id === imageChannelId && !message.channel.isThread();
        if (targetChannel && isInImageChannel) {
            const hasMediaAttachment = message.attachments.some(att => att.contentType?.startsWith("image/") || att.contentType?.startsWith("video/"));
            const hasMediaLink = IMAGE_EXTENSIONS.test(message.content) || DISCORD_MEDIA_REGEX.test(message.content);
            if (!hasMediaAttachment && !hasMediaLink) {
                try {
                    await message.delete();
                    return;
                }
                catch (error) {
                    console.error("Failed to delete message:", error);
                }
            }
            else {
                const postNumber = await incrementPostCount(message.guild.id);
                try {
                    const reactions = [
                        getEmoji("reactions.user.heart"),
                        getEmoji("reactions.user.thumbsup"),
                        getEmoji("reactions.user.thumbsdown"),
                        getEmoji("reactions.user.haha"),
                        getEmoji("reactions.user.emphasize"),
                        getEmoji("reactions.user.question"),
                    ];
                    for (const reaction of reactions) {
                        await message.react(reaction);
                    }
                    await message.startThread({
                        name: `Post #${postNumber}`,
                        autoArchiveDuration: 60,
                    });
                }
                catch (error) {
                    console.error("Error creating thread or reactions:", error);
                }
            }
            return;
        }
        // ------------------ KARU THREAD HANDLING ------------------ //
        const isKaruThread = message.channel.isThread() && message.channel.name.startsWith("💭");
        let userPrompt = message.content?.trim() || "";
        userPrompt = userPrompt.replace(/<@!?\d+>/g, "").trim();
        if (!userPrompt && message.attachments.size > 0) {
            userPrompt = `Attachment: ${message.attachments.first()?.name || "file"}`;
        }
        if (!userPrompt)
            return;
        if (isKaruThread) {
            const connection = getMongooseConnection();
            if (connection) {
                try {
                    await MessageModel.create({
                        userId: message.author.id,
                        guildId: message.guild.id,
                        threadId: message.channel.id,
                        content: userPrompt,
                        timestamp: new Date(),
                    });
                }
                catch (error) {
                    log("error", "Failed to log message to MongoDB:", error);
                }
            }
            else {
                log("error", "Mongoose connection is not established. Cannot log message.");
            }
            await handleKaruMessage(message, message.channel, userPrompt);
            return;
        }
        if (message.channel instanceof TextChannel) {
            if (!message.mentions.has(message.client.user))
                return;
            const summaryModel = karu.getGenerativeModel({
                model: "gemma-3n-e4b-it",
                generationConfig: {
                    temperature: 0.2,
                    maxOutputTokens: 32,
                },
            });
            const summaryPrompt = `Summarize the following user message in under 5 words for use as a thread title:\n"${userPrompt}"`;
            try {
                const summaryResult = await summaryModel.generateContent(summaryPrompt);
                let threadName = summaryResult.response
                    .text()
                    ?.replace(/[*_~`>#\n\r]/g, "")
                    .trim()
                    .slice(0, 80);
                if (!threadName)
                    threadName = `💭 Käru & ${message.author.username}`;
                const thread = await message.startThread({
                    name: `💭 ${threadName}`,
                    autoArchiveDuration: 60,
                });
                await handleKaruMessage(message, thread, userPrompt);
            }
            catch (error) {
                console.error("Error in thread creation or AI generation:", error);
            }
        }
    },
};
export default messageCreateEvent;
