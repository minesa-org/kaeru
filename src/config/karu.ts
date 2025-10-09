import { GoogleGenerativeAI } from "@google/generative-ai";

export const karu = new GoogleGenerativeAI(process.env.KARU_API_KEY!);
