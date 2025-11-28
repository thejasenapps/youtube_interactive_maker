import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const API_KEY = process.env.GEMINI_API_KEY;
if (!API_KEY) {
  throw new Error("Missing GEMINI API key. Please set API_KEY in .env");
}

const genAI = new GoogleGenerativeAI(API_KEY);

export const generateWithGemini = async (
  prompt,
  options = {}
) => {
  const model = genAI.getGenerativeModel({
    model: options.model || "gemini-2.5-flash",
    geminiConfig: {
      temperature: options.temperature ?? 0.7,
      topP: options.topP ?? 1,
      topK: options.topK ?? 1,
      maxOutputTokens: options.maxOutputTokens ?? 512,
      ...options.geminiConfigOverrides,
    }
  });

  const res = await model.generateContent(prompt);
  return res.text();
};
