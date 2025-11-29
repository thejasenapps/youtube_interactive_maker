import fs from 'fs';
import FormData from 'form-data';
import axios from 'axios';


export const transcribeWithGroq = async (audioPath) => {
  if (!fs.existsSync(audioPath)) {
    throw new Error(`Audio file does not exist: ${audioPath}`);
  }

  const form = new FormData();
  form.append('file', fs.createReadStream(audioPath));
  form.append('model', 'whisper-large-v3');
  form.append('response_format', 'json');

  try {
    const response = await axios.post(
      'https://api.groq.com/openai/v1/audio/transcriptions',
      form,
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          ...form.getHeaders(),
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity, // Ensure large files are supported
      }
    );

    return response.data.text;
  } finally {
    // Cleanup the temporary file to avoid /tmp overflow in Vercel
    try {
      fs.unlinkSync(audioPath);
    } catch (err) {
      console.warn('Failed to delete temp audio file:', err);
    }
  }
};
