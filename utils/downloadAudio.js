import fs from "fs";
import axios from "axios";

const FASTAPI_URL = "https://web-production-a3481.up.railway.app/download";

export async function downloadYouTubeAudio(videoId) {
  const response = await axios.post(
    FASTAPI_URL,
    { videoId },
    { responseType: "stream" }
  );

  const tmpPath = `/tmp/${videoId}.mp3`;
  const writer = fs.createWriteStream(tmpPath);
  response.data.pipe(writer);

  await new Promise((resolve, reject) => {
    writer.on("finish", resolve);
    writer.on("error", reject);
  });

  return tmpPath;
}
