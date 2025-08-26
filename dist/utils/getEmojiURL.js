import { log } from "../utils/colors.js";
export var EmojiSize;
(function (EmojiSize) {
    EmojiSize[EmojiSize["Small"] = 16] = "Small";
    EmojiSize[EmojiSize["Medium"] = 32] = "Medium";
    EmojiSize[EmojiSize["Large"] = 64] = "Large";
    EmojiSize[EmojiSize["Max"] = 128] = "Max";
})(EmojiSize || (EmojiSize = {}));
/**
 * Extracts the emoji ID from a Discord emoji string and returns the CDN URL.
 * @param {string} emojiString - The emoji string (e.g., "<:bubblelock:1398380591300218881>")
 * @param {number} [size=64] - The size of the emoji image (default: 64)
 * @returns {string} The Discord CDN URL for the emoji image
 */
export function getEmojiURL(emojiString, size = EmojiSize.Large) {
    const fallbackEmojiId = "1353817612525637734";
    if (!emojiString || typeof emojiString !== "string") {
        log("warning", "getEmojiURL: Invalid emoji string, using fallback");
        return `https://cdn.discordapp.com/emojis/${fallbackEmojiId}.png?size=${size}`;
    }
    const emojiId = emojiString.match(/:(\d+)>/)?.[1];
    if (!emojiId) {
        log("warning", "getEmojiURL: Emoji ID not found, using fallback");
        return `https://cdn.discordapp.com/emojis/${fallbackEmojiId}.png?size=${size}`;
    }
    const url = `https://cdn.discordapp.com/emojis/${emojiId}.png?size=${size}`;
    return url;
}
