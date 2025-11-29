import { downloadYouTubeAudio } from "../utils/downloadAudio.js";
import { transcribeWithGroq } from "../utils/transcribeWithGroq.js";
import { askGeminiQuestions } from "../utils/askGemini.js";

export default async function handler(req, res) {

    if (req.method !== "POST") {
        res.setHeader("Allow", ["POST"]);
        return res.status(405).json({ error: "Method not allowed" });
    }

    const { videoId } = req.body;

    if (!videoId || !videoId.match(/^[a-zA-Z0-9_-]{11}$/)) {
        return res.status(400).json({ error: "Invalid YouTube video ID" });
    }

    try {
        const audioPath = await downloadYouTubeAudio(videoId);

        const transcript = await transcribeWithGroq(audioPath);

        const questions = await askGeminiQuestions(transcript);

        const trimmedTranscript =
            transcript && transcript.length > 2000
                ? transcript.slice(0, 2000) + "..."
                : transcript || "";

        return res.status(200).json({
            videoId,
            youtubeUrl: `https://www.youtube.com/watch?v=${videoId}`,
            transcript: trimmedTranscript,
            questions,
            generatedAt: new Date().toISOString(),
        })

    } catch (err) {
        console.error("Handler error:", err);
        res.status(500).json({ error: "Processing failed: " + err.message });
    }
}
