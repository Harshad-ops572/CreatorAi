import ffmpeg from 'fluent-ffmpeg';
import ffmpegStatic from 'ffmpeg-static';
import ffprobeStatic from 'ffprobe-static';

export function setupFFmpeg(): void {
  try {
    if (ffmpegStatic) {
      ffmpeg.setFfmpegPath(ffmpegStatic);
      console.log('FFmpeg binary path set to:', ffmpegStatic);
    }
    if (ffprobeStatic && ffprobeStatic.path) {
      ffmpeg.setFfprobePath(ffprobeStatic.path);
      console.log('FFprobe binary path set to:', ffprobeStatic.path);
    }
  } catch (error) {
    console.warn('Warning: Could not configure static ffmpeg/ffprobe binary path:', error);
  }
}

export { ffmpeg };
