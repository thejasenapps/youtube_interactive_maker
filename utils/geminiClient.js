import { GoogleGenerativeAI } from "@google/generative-ai";
import  dotenv from "dotenv";

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

  if (!prompt || prompt.trim() === "") {
    throw new Error("Prompt is empty");
  }

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

    try {
    const res = await model.generateContent(prompt);
    const text = res.response.text();

    if (!text) {
      throw new Error("No content returned from Gemini");
    }

    return text;
  } catch (err) {
    console.error("Gemini API error:", err.message || err);
    throw new Error("Failed to generate content with Gemini");
  }
};
