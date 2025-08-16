import { SlashCommandBuilder } from "discord.js";
import { EmojiSize, getEmoji, getEmojiURL, sendErrorMessage } from "../../utils/export.js";
const pingCommand = {
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
            return sendErrorMessage(interaction, `Invalid emoji. Hmm...`, "info");
        }
        try {
            const url = getEmojiURL(emoji, size ?? EmojiSize.Large);
            return interaction.reply({
                content: `# ${getEmoji("brain")} Here is your emoji URL:\n> ${url}`,
            });
        }
        catch (error) {
            return sendErrorMessage(interaction, `Failed to get emoji.`, "reactions.kaeru.question");
        }
    },
};
export default pingCommand;
