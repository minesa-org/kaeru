import { GoogleGenerativeAI } from "@google/generative-ai";

export const KARU_AI = new GoogleGenerativeAI(process.env.KARU_API_KEY!);