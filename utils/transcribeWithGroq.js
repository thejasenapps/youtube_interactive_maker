import fs from 'fs';
import FormData from 'form-data';
import axios from 'axios';

export const transcribeWithGroq = async (audioPath) => {
    const form = new FormData();
    form.append('file', fs.createReadStream(audioPath));
    form.append('model', 'whisper-large-v3');
    form.append('resposne_format', 'json');

    const response = await axios.post(
        'https://api.groq.ai/v1/audio/transcriptions', 
        form, 
        {
            headers: {
                Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
                ...form.getHeaders(),
            }
        }
    );

    return response.data.text;
}