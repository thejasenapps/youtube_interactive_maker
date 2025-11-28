import ytdl from 'ytdl-core';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegStatic from '@ffmpeg-installer/ffmpeg';
import { resolve } from 'path';

ffmpeg.setFfmpegPath(ffmpegStatic.path);

export const downloadYouTubeAudio = (videoId) => {
    return new Promise((resolve, reject) => {
        const audioPath = '/tmp/${videoId}.mp3';
        const stream = ytdl(`https://www.youtube.com/watch?v=${videoId}`, {
            filter: 'audioonly',
            quality: 'highestaudio',
        });

        ffmpeg(stream)
            .audioBitrate(128)
            .save(audioPath)
            .on('end', () => resolve(audioPath))
            .on('error', (err) => reject(err));
    });
};