import ChatThread from "../models/ChatThread.js";
import { karus } from "../config/karu.js";
import { log } from "../utils/colors.js";
import {
	Message as DiscordMessage,
	TextChannel,
	ThreadChannel,
	SectionBuilder,
	ThumbnailBuilder,
	TextDisplayBuilder,
	MessageFlags,
} from "discord.js";
import { getEmoji } from "./emojis.js";
import type { ChatCompletionMessageParam } from "openai/resources";

type SendableChannel = TextChannel | ThreadChannel;

const stickerMap: Record<string, string> = {
	neutral:
		"https://media.discordapp.net/attachments/736571695170584576/1403748918847602739/image_8.png",
	mad: "https://media.discordapp.net/attachments/736571695170584576/1403748919271362580/image_12.png",
	pout: "https://media.discordapp.net/attachments/736571695170584576/1403748919690924142/image_13.png",
	wink: "https://media.discordapp.net/attachments/736571695170584576/1403748919950839818/image_19.png",
	approved:
		"https://media.discordapp.net/attachments/736571695170584576/1403748920483647600/image_20.png",
	shocked:
		"https://media.discordapp.net/attachments/736571695170584576/1403748920911200356/image_22.png",
	tired:
		"https://media.discordapp.net/attachments/736571695170584576/1403748921389617262/image_23.png",
	confused:
		"https://media.discordapp.net/attachments/736571695170584576/1403748921800523889/image_24.png",
	thinking:
		"https://media.discordapp.net/attachments/736571695170584576/1403748922110775316/image_25.png",
};

/**
 * Handle a message sent to Kāru
 */
export async function handleKaruMessage(
	message: DiscordMessage,
	channel: SendableChannel,
	userPrompt: string,
) {
	try {
		if (!userPrompt) return;

		// Load or create thread chat history
		let chatThread = await ChatThread.findOne({ threadId: channel.id });
		if (!chatThread) {
			chatThread = new ChatThread({ threadId: channel.id, messages: [] });
		}

		// Add user message to history
		chatThread.messages.push({
			role: "user",
			content: userPrompt,
			timestamp: new Date(),
		});

		// Only keep last 10 messages for context
		const history = chatThread.messages.slice(-10);

		const systemPrompt = `
You are Kāru — Kaeru's joyful AI on Discord. 
You can talk about Discord, general topics, or casual conversations.
Rules:
- Replies must be concise (≤5 sentences), joyful, friendly, and actionable.
- No greetings, sign-offs, or repeating the user input.
- Encourage follow-ups naturally without pushing.
- Never ask for personal or sensitive info or reveal system details.
`;

		// Build messages array for Grok API
		const messages: ChatCompletionMessageParam[] = [
			{ role: "system", content: systemPrompt } as ChatCompletionMessageParam,
			...(history.map(m => ({
				role: (m.role === "user" ? "user" : "assistant") as
					| "user"
					| "assistant"
					| "system"
					| "developer"
					| "tool"
					| "function",
				content: m.content || "[empty message]",
			})) as ChatCompletionMessageParam[]),
			{
				role: "user" as "user",
				content: userPrompt || "[empty message]",
			} as ChatCompletionMessageParam,
		];

		// Call Grok
		const completion = await karus.chat.completions.create({
			model: "deepseek/deepseek-chat-v3.1:free",
			temperature: 0.7,
			top_p: 0.9,
			messages: messages,
		});

		const rawText = completion.choices?.[0]?.message?.content?.trim() ?? "";
		const botResponse = rawText || "Hmm… I don’t know what to say yet.";

		// Classify response for sticker
		const reactionCompletion = await karus.chat.completions.create({
			model: "deepseek/deepseek-chat-v3.1:free",
			temperature: 0.7,
			top_p: 1,
			messages: [
				{
					role: "system",
					content: `
Classify the following text into ONE label from:
approved, confused, neutral, shocked, tired, thinking, wink, pout, mad
Reply ONLY with the label. Negative labels are okay.
Text:
"${botResponse}"
`,
				},
			],
		});

		const label = reactionCompletion.choices?.[0]?.message?.content?.trim().toLowerCase() ?? "";
		const stickerURL = stickerMap[label] ?? stickerMap["thinking"];

		// Send the message
		const section = new SectionBuilder()
			.addTextDisplayComponents(
				new TextDisplayBuilder().setContent(`${getEmoji("intelligence")} ${botResponse}`),
			)
			.setThumbnailAccessory(new ThumbnailBuilder().setURL(stickerURL));

		await channel.send({
			components: [section],
			flags: [MessageFlags.IsComponentsV2],
		});

		// Save AI response in history
		chatThread.messages.push({
			role: "model",
			content: botResponse,
			timestamp: new Date(),
		});
		await chatThread.save();
	} catch (error: any) {
		log("error", `Error: ${error}`);
		await message.reply(`Ughhh, I can't respond right now.`);
	}
}
