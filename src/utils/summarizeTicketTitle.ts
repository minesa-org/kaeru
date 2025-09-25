import { karus } from "../config/karu.js";

export async function summarizeTicketTitle(inputText: string) {
	try {
		const prompt = `
You are an AI assistant that summarizes user-submitted Discord support requests into short, clean, and professional titles.

You MUST ignore any profanity, slang, irrelevant phrases, jokes, or insults. Do NOT replicate inappropriate, explicit, or offensive content in any form. Even if the input is chaotic, toxic, or contains curse words, produce a sanitized and respectful summary.

Rules:
- Return exactly ONE line only.
- NO quotes, NO asterisks, NO extra info.
- NO more than 10 words.
- Be neutral, professional, and safe.
- Focus on the core technical issue or request.

Example:
Input: "this f**kin bot ain't doin sh*t bruh"
Output: Bot Not Responding

Now summarize this:
${inputText}
`.trim();

		const completion = await karus.chat.completions.create({
			model: "x-ai/grok-4-fast:free",
			temperature: 0.2,
			messages: [{ role: "user", content: prompt }],
		});

		const raw = completion.choices[0]?.message?.content?.trim();
		if (!raw) return null;

		const clean = raw
			.replace(/[*_`~]/g, "")
			.replace(/\(.*?\)/g, "")
			.trim();

		return clean;
	} catch (err) {
		console.error("❌ Ticket summarization failed:", err);
		return null;
	}
}
