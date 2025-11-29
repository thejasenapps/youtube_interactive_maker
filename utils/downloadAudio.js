import { spawn } from "child_process";
import fs from "fs";
import os from "os";
import path from "path";


export async function downloadYouTubeAudio(videoId) {

  const url = `https://www.youtube.com/watch?v=${videoId}`;

  const tmpOutput = path.join(os.tmpdir(), `${videoId}.m4a`);
  const ytBinaryPath = path.join(process.cwd(), "yt-dlp"); // bundled binary in project root

  return new Promise((resolve, reject) => {
    // Ensure output stream
    const fileStream = fs.createWriteStream(tmpOutput);

    // Spawn standalone yt-dlp
    const ytdlp = spawn(ytBinaryPath, [
      "--no-playlist",
      "-f", "bestaudio[ext=m4a]/bestaudio/best",
      "-o", "-", // output to stdout
      url
    ]);


    // Pipe yt-dlp stdout → temp file
    ytdlp.stdout.pipe(fileStream);

    // Capture errors
    let errorStderr = "";
    ytdlp.stderr.on("data", (d) => { errorStderr += d.toString(); });

    ytdlp.on("error", (err) => reject(err));
    
    ytdlp.on("close", (code) => {
      if (code !== 0) {
        return reject(
          new Error(`yt-dlp failed with code ${code}. Error: ${errorStderr}`)
        );
      }
      resolve(tmpOutput); 
    });

    fileStream.on("error", (err) => reject(err));
  });
}
