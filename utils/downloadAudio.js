import { spawn } from "child_process";
import fs from "fs";
import os from "os";
import path from "path";
import ffmpeg from "fluent-ffmpeg";
import ffmpegStatic from "@ffmpeg-installer/ffmpeg";

ffmpeg.setFfmpegPath(ffmpegStatic.path);

export async function downloadYouTubeAudio(videoId) {

  const url = `https://www.youtube.com/watch?v=${videoId}`;

  // Temp file for the downloaded audio (usually webm/m4a)
  const tmpInput = path.join(os.tmpdir(), `${videoId}.webm`);
  const tmpOutput = path.join(os.tmpdir(), `${videoId}.mp3`);

  return new Promise((resolve, reject) => {
    const ytdlp = spawn("yt-dlp", [
      "--no-playlist",
      "-f", "bestaudio[ext=webm]/bestaudio/best",
      "-o", "-",          // output to stdout
      url
    ]);

    const fileStream = fs.createWriteStream(tmpInput);

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
      // When finished writing temp file → convert using ffmpeg
      convertToMP3(tmpInput, tmpOutput, resolve, reject);
    });

    fileStream.on("error", (err) => reject(err));
  });
}


function convertToMP3(input, output, resolve, reject) {
  ffmpeg(input)
    .format("mp3")
    .audioBitrate(128)
    .save(output)
    .on("end", () => {
      try { fs.unlinkSync(input); } catch (_) {}
      resolve(output); // Return the final mp3 path
    })
    .on("error", reject);
}
