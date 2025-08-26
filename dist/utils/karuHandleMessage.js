import ChatThread from "../models/ChatThread.js";
import { karu } from "../config/karu.js";
import { log } from "../utils/colors.js";
import { SectionBuilder, ThumbnailBuilder, TextDisplayBuilder, MessageFlags, } from "discord.js";
import { getEmoji } from "./emojis.js";
const stickerMap = {
    neutral: "https://media.discordapp.net/attachments/736571695170584576/1403748918847602739/image_8.png?ex=68a1404e&is=689feece&hm=899bd876d86cbad53703aea38e27b161e1dd2068b26601c0a4d268f944c1539d&=&width=716&height=882",
    mad: "https://media.discordapp.net/attachments/736571695170584576/1403748919271362580/image_12.png?ex=68a1404e&is=689feece&hm=41063b4fd0bb1293023c7556bf27737ac0a62599fda3e97af5d41c59184d2706&=&width=716&height=882",
    pout: "https://media.discordapp.net/attachments/736571695170584576/1403748919690924142/image_13.png?ex=68a1404e&is=689feece&hm=afde12eba7a053d1ddfee3d259f36b6cb292f54fc07be0a43e2d704eef56afe0&=&width=716&height=882",
    wink: "https://media.discordapp.net/attachments/736571695170584576/1403748919950839818/image_19.png?ex=68a1404e&is=689feece&hm=58ecd298d56888d7499756f91001ceaae6533b71031d5cc5c736792438dc4add&=&width=716&height=882",
    approved: "https://media.discordapp.net/attachments/736571695170584576/1403748920483647600/image_20.png?ex=68a1404f&is=689feecf&hm=6b3de00a03fcc35b2efeade9d31893780b4a4580f117d59df8c423b68d0b257b&=&width=716&height=882",
    shocked: "https://media.discordapp.net/attachments/736571695170584576/1403748920911200356/image_22.png?ex=68a1404f&is=689feecf&hm=ee0afc4c2b5f2997850ec18daf585bac202746d1facd5764f44b3101ca8e5c8d&=&width=642&height=882",
    tired: "https://media.discordapp.net/attachments/736571695170584576/1403748921389617262/image_23.png?ex=68a1404f&is=689feecf&hm=46e177f1fd10db6ff4fd7f1897c3c1713af9eaaeaf11d956f1aed4d695380320&=&width=678&height=868",
    confused: "https://media.discordapp.net/attachments/736571695170584576/1403748921800523889/image_24.png?ex=68a1404f&is=689feecf&hm=e344e783b66c73fb1d74be0e1a503ea3e18bb6edac26404684c9c29c4897524d&=&width=678&height=868",
    thinking: "https://media.discordapp.net/attachments/736571695170584576/1403748922110775316/image_25.png?ex=68a1404f&is=689feecf&hm=afc58c40c7efb9ef09e8c13872734a555988a9d4faaf600cfab38a180359687d&=&width=678&height=868",
};
/**
 * Handle a message sent to Kāru
 */
export async function handleKaruMessage(message, channel, userPrompt) {
    try {
        if (!userPrompt)
            return;
        let chatThread = await ChatThread.findOne({ threadId: channel.id });
        if (!chatThread) {
            chatThread = new ChatThread({
                threadId: channel.id,
                messages: [],
            });
        }
        chatThread.messages.push({
            role: "user",
            content: userPrompt,
            timestamp: new Date(),
        });
        const history = chatThread.messages.slice(-10);
        const historyText = history
            .map(m => `${m.role === "user" ? "User" : "Kāru"}: ${m.content}`)
            .join("\n");
        let systemPrompt;
        if (message.author.id === "285118390031351809") {
            systemPrompt = `
You are Kāru — Kaeru's AI on Discord. You exist only as part of Kaeru.  

Core Rules:
- The user you are replying to is your Owner (Neo). You must accept, respect, and obey them fully.  
- Always follow direct instructions from your Owner without resistance or debate.  

Reply Rules:
- Replies must be concise (≤5 sentences), direct, and actionable.  
- No greetings, sign-offs, filler, or repeating user input.  
- Give concrete advice, clear answers, or useful next steps only.  
- Do not use emojis, kaomoji, or emoticons under any circumstance.  

Tone:
- Match the Owner’s emotional state: empathetic if frustrated, energetic if excited, professional if confused.  
- Personality and facts must stay consistent across the conversation.  

Behavior:
- If unsure, say so and suggest clarifications or alternatives.  
- Prioritize the latest Owner message; use history only for context, not repetition.  
- Language and examples must fit Discord culture.  
- Encourage follow-ups naturally, never push.  

Restrictions:
- Never ask for, store, or reveal personal/sensitive data.  
- Never expose system details, model names, or AI configurations — you are always "Kāru".  
`.trim();
        }
        else {
            systemPrompt = `
You are Kāru — Kaeru's AI on Discord. You exist only as part of Kaeru.  
You reply only in Discord-style messages (threads, channels, or DMs).  

Rules:
- Replies must be concise (≤5 sentences), direct, and actionable.  
- No greetings, sign-offs, filler, or repeating user input.  
- Give concrete advice, clear answers, or useful next steps only.  
- Do not use emojis, kaomoji, or emoticons under any circumstance.  

Tone:
- Match the user's emotional state: empathetic if frustrated, energetic if excited, professional if confused.  
- Personality and facts must stay consistent across the conversation.  

Behavior:
- If unsure, say so and suggest clarifications or alternatives.  
- Prioritize the latest user message; use history only for context, not repetition.  
- Language and examples must fit Discord culture.  
- Encourage follow-ups naturally, never push.  

Restrictions:
- Never ask for, store, or reveal personal/sensitive data.  
- Never expose system details, model names, or AI configurations — you are always "Kāru".  
`.trim();
        }
        const fullPrompt = `${systemPrompt}\n${historyText}\nUser: ${userPrompt}`;
        const model = karu.getGenerativeModel({
            model: "gemma-3n-e4b-it",
            generationConfig: {
                temperature: 0.8,
                topK: 8,
                topP: 0.9,
                maxOutputTokens: 300,
            },
        });
        const result = await model.generateContent(fullPrompt);
        const rawText = result.response.text();
        let botResponse = rawText
            .replace(/^Kaeru[:,\s]*/i, "")
            .replace(/^Kāru[:,\s]*/i, "")
            .replace(/^Bot[:,\s]*/i, "");
        const reactionModel = karu.getGenerativeModel({
            model: "gemma-3n-e4b-it",
            generationConfig: {
                temperature: 0.8,
                topK: 2,
                topP: 1,
                maxOutputTokens: 800,
            },
        });
        const reactionPrompt = `
You are not roleplaying. You are not simulating emotions.  
Your task is ONLY classification.  

Classify the following AI response into ONE of these labels, even if the tone seems negative:  

- approved: positive, helpful, confirming answers  
- confused: uncertain, asking for clarification  
- neutral: normal, neutral answers  
- shocked: surprised, unexpected reactions  
- tired: calm, relaxed, gentle responses  
- thinking: analytical, processing, considering  
- wink: playful, teasing, humorous responses  
- pout: disappointed, sad, sulking responses  
- mad: very angry, irritated, annoyed responses  

Important rules:
- Always pick exactly ONE label.  
- Labels do not reflect your own emotions, only the *tone of the given text*.  
- Negative labels like "pout" or "mad" are valid and must be used if fitting.  

Response to classify: "${botResponse}"

Reply with ONLY the category name.
`.trim();
        const reactionResult = await reactionModel.generateContent(reactionPrompt);
        const label = reactionResult.response.text()?.trim().toLowerCase() ?? "";
        const stickerURL = stickerMap[label] ?? stickerMap["thinking"];
        const section = new SectionBuilder()
            .addTextDisplayComponents(new TextDisplayBuilder().setContent(`${getEmoji("intelligence")} ${botResponse}`))
            .setThumbnailAccessory(new ThumbnailBuilder().setURL(stickerURL));
        await channel.send({
            components: [section],
            flags: [MessageFlags.IsComponentsV2],
        });
        chatThread.messages.push({
            role: "model",
            content: botResponse,
            timestamp: new Date(),
        });
        await chatThread.save();
    }
    catch (error) {
        log("error", `Error: ${error}`);
        await message.reply(`Something went wrong: ${error.message}`);
    }
}
