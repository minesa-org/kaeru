import { SlashCommandBuilder } from "discord.js";
import { containerTemplate, EmojiSize, getEmojiURL, sendAlertMessage } from "../../utils/export.js";
const emojiURL = {
    data: new SlashCommandBuilder()
        .setName("emoji-url")
        .setDescription("Get emoji URL.")
        .addStringOption(option => option.setName("emoji").setDescription("Emoji to get URL for").setRequired(true))
        .addIntegerOption(option => option
        .setName("size")
        .setDescription("Size of the emoji (in pixels)")
        .setRequired(false)
        .addChoices({ name: "Small", value: EmojiSize.Small }, { name: "Medium", value: EmojiSize.Medium }, { name: "Large", value: EmojiSize.Large }, { name: "Maximum", value: EmojiSize.Max })),
    execute: async (interaction) => {
        const emoji = interaction.options.getString("emoji");
        const size = interaction.options.getInteger("size")?.valueOf();
        if (!emoji || !emoji.includes(":")) {
            return sendAlertMessage({
                interaction,
                content: `Hmm... Invalid emoji.`,
                type: "error",
                tag: "Invalid Emoji",
            });
        }
        try {
            const url = getEmojiURL(emoji, size ?? EmojiSize.Large);
            return interaction.reply({
                components: [
                    containerTemplate({
                        description: "Emoji is on below",
                        tag: `Emoji Output`,
                        images: [url],
                    }),
                ],
            });
        }
        catch (error) {
            return sendAlertMessage({
                interaction,
                content: `Failed to get emoji. Sorry.`,
                type: "error",
                tag: "Emoji Getting",
            });
        }
    },
};
export default emojiURL;
