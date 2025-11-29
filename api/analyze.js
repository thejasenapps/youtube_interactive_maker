import express from "express";
import cors from "cors";
import dotenv from "dotenv"
import { downloadYouTubeAudio } from "../utils/downloadAudio.js";
import { transcribeWithGroq } from "../utils/transcribeWithGroq.js";
import { askGeminiQuestions } from "../utils/askGemini.js";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

app.post("/api/analyze", async (req, res) => {

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

        res.json({
            videoId,
            youtubeUrl: `https://www.youtube.com/watch?v=${videoId}`,
            transcript: trimmedTranscript,
            questions,
            generatedAt: new Date().toISOString(),
        });

    } catch (err) {
        console.error("Handler error:", err);
        res.status(500).json({ error: "Processing failed: " + err.message });
    }
    
});


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
