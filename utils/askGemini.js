import axios from 'axios';

export const askGeminiQuestions = async (transcript) => {
  const prompt = `
You are an expert educator. Based on the following YouTube video transcript, generate **exactly 3 insightful, high-quality questions** that test deep understanding of the content.

Transcript:
${transcript}

Return only a JSON array like this:
["Question 1?", "Question 2?", "Question 3?"]
  `.trim();

  const response = await axios.post(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      contents: [
        {
          parts: [
            { text: prompt }
          ]
        }
      ]
    }
  );

  try {
    const text = response.data.candidates[0].content.parts[0].text;
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return ["Failed to parse questions"];
  } catch (err) {
    return ["Error generating questions", err.message];
  }
};