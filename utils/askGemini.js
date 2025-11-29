import { generateWithGemini } from "./geminiClient.js";

export const askGeminiQuestions = async (transcript) => {
  if (!transcript || transcript.trim().length === 0) {
    throw new Error("Transcript is empty");
  }
  
  const prompt = `
${transcript}\n\nGenerate question, multiple options and correct answer for the given videoId and for the given time interval using the following rules:
1. Three questions that can be asked from the given transcript just after a particular topic is discussed
2. All the values should be in one line
3. Timestamp should be first, questions second and then multiple options and then answers, all separated by '-'
4. There should be three options and all options should separated by '_'
5. No other explanation or text is needed
  `.trim();

  try {
    const output = await generateWithGemini(prompt, {
      maxOutputTokens: 400,
      temperature: 0.5
    });

    // Try parse JSON if model returned JSON; otherwise return raw output:
    try {
      return JSON.parse(output);
    } catch {
      return output;
    }
  } catch (err) {
    console.error("Gemini generation error:", err);
    throw err;
  }

};
