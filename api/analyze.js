import { downloadYouTubeAudio } from "../utils/downloadAudio.js";
import { transcribeWithGroq } from "../utils/transcribeWithGroq.js";
import { askGeminiQuestions } from "../utils/askGemini.js";
import { error } from "console";

export default async function handler(req, res) {
    if(req.method !== 'POST') {
        return res.status(405).json({error: 'Method not allowed'});
    }

    const { videoId } = req.body;

    if(!videoId || !videoId.match(/^[a-zA-Z0-9_-]{11}$/)) {
        return res.status(400).json({error: 'Invalid YouTube video ID'});
    }

    try {
        res.writeHead(200, {
            'Content-Type': 'application/json',
            'Transfer-Encoding': 'chunked',
        });
        res.write(JSON.stringify({status: 'Downloading audio...'}) + '\n');

        const audioPath = await downloadYouTubeAudio(videoId);
        res.write(JSON.stringify({status: 'Transcribing audio...'}) + '\n');

        const transcript = await transcribeWithGroq(audioPath);
        res.write(JSON.stringify({status: 'Transcription complete, asking Gemini...'}) + '\n');

        const questions = await askGeminiQuestions(transcript);

        if (fstat.existsSync(audioPath)) fs.unlinkSync(audioPath);

        const result = {
            videoId,
            youtubeUrl: `https://www.youtube.com/watch?v=${videoId}`,
            transcript: transcript.slice(0, 2000) + (transcript.length > 2000 ? '...' : ''),
            questions,
            generatedAt: new Date().toISOString(),
        };

        res.write(JSON.stringify(result) +'\n');
        res.end();
    } catch(error) {
        console.error(error);
        res.status(500).json({
            error: 'Processing failed',
            message: error.message,
        });
    }
}
