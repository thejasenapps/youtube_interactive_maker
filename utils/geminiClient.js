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

   const res = await model.generateContent({
    prompt: [{ text: prompt }]
  });

  // Access the text from the response object
  // SDK v0.9+ typically returns: res.candidates[0].content[0].text
  const text = res?.candidates?.[0]?.content?.[0]?.text;
  if (!text) throw new Error("No content returned from Gemini");

  return text;
};
