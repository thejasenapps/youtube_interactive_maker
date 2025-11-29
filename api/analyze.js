import fs from "fs";
import { downloadYouTubeAudio } from "../utils/downloadAudio.js";
import { transcribeWithGroq } from "../utils/transcribeWithGroq.js";
import { askGeminiQuestions } from "../utils/askGemini.js";

export default async function handler(req, res) {

    if (req.method !== 'POST') {
        return req.sendError("Method not allowed", 405);
    }

    const { videoId } = req.body;

    if (!videoId || !videoId.match(/^[a-zA-Z0-9_-]{11}$/)) {
        return req.sendError("Invalid YouTube video ID", 400);
    }

    try {
        req.sendChunk({ status: "Downloading audio..." });

        const audioPath = await downloadYouTubeAudio(videoId);

        req.sendChunk({ status: "Transcribing audio..." });

        const transcript = await transcribeWithGroq(audioPath);

        req.sendChunk({ status: "Transcription complete. Asking Gemini..." });

        const questions = await askGeminiQuestions(transcript);

        req.sendChunk({ status: "Processing complete", data: questions });

        try {
            if (fs.existsSync(audioPath)) fs.unlinkSync(audioPath);
        } catch (cleanupErr) {
            console.error("Failed to delete audio file:", cleanupErr);
        }

        const trimmedTranscript =
            transcript && transcript.length > 2000
                ? transcript.slice(0, 2000) + "..."
                : transcript || "";

        const result = {
            videoId,
            youtubeUrl: `https://www.youtube.com/watch?v=${videoId}`,
            transcript: trimmedTranscript,
            questions,
            generatedAt: new Date().toISOString(),
        };

        req.endResponse(result);

    } catch (err) {
        console.error("Handler error:", err);
        req.sendError("Processing failed: " + err.message);
    }
}
