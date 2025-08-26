import { karu } from "../config/karu.js";
export async function summarizeTicketTitle(inputText) {
    try {
        const model = karu.getGenerativeModel({
            model: "gemma-3n-e4b-it",
            generationConfig: {
                temperature: 0.2,
                maxOutputTokens: 60,
                topP: 1,
                topK: 1,
            },
        });
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
        const result = await model.generateContent(prompt);
        const raw = result?.response?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!raw) {
            return null;
        }
        const clean = raw
            .replace(/[*_`~]/g, "")
            .replace(/\(.*?\)/g, "")
            .trim();
        return clean;
    }
    catch (err) {
        console.error("❌ Ticket summarization failed:", err);
        return null;
    }
}
