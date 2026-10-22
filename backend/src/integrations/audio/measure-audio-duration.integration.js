import { runFfmpegIntegration } from '#src/integrations/audio/run-ffmpeg.integration.js';

const MEASURE_SAMPLE_RATE = 8000;
const BYTES_PER_SAMPLE = 2;

export async function measureAudioDurationIntegration({ buffer }) {
  try {
    const pcm = await runFfmpegIntegration({
      args: [
        '-hide_banner',
        '-loglevel',
        'error',
        '-i',
        'pipe:0',
        '-vn',
        '-ac',
        '1',
        '-ar',
        String(MEASURE_SAMPLE_RATE),
        '-f',
        's16le',
        'pipe:1',
      ],
      input: buffer,
    });

    return pcm.length / (MEASURE_SAMPLE_RATE * BYTES_PER_SAMPLE);
  } catch {
    return null;
  }
}
