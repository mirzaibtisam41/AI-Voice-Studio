import {
  AUDIO_FORMAT,
  AUDIO_FORMAT_CONTENT_TYPE,
} from '#src/modules/audio-files/audio-file.constants.js';
import { runFfmpegIntegration } from '#src/integrations/audio/run-ffmpeg.integration.js';

const BYTES_PER_SAMPLE = 2;
const WAV_HEADER_BYTES = 44;

const FFMPEG_OUTPUTS = {
  [AUDIO_FORMAT.MP3]: {
    extension: 'mp3',
    args: ['-c:a', 'libmp3lame', '-b:a', '128k', '-f', 'mp3'],
  },
  [AUDIO_FORMAT.OPUS]: {
    extension: 'ogg',
    args: ['-c:a', 'libopus', '-b:a', '64k', '-f', 'ogg'],
  },
  [AUDIO_FORMAT.AAC]: {
    extension: 'aac',
    args: ['-c:a', 'aac', '-b:a', '128k', '-f', 'adts'],
  },
  [AUDIO_FORMAT.FLAC]: {
    extension: 'flac',
    args: ['-c:a', 'flac', '-f', 'flac'],
  },
};

function buildWav({ pcm, sampleRate }) {
  const header = Buffer.alloc(WAV_HEADER_BYTES);

  header.write('RIFF', 0, 'ascii');
  header.writeUInt32LE(36 + pcm.length, 4);
  header.write('WAVE', 8, 'ascii');
  header.write('fmt ', 12, 'ascii');
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(1, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(sampleRate * BYTES_PER_SAMPLE, 28);
  header.writeUInt16LE(BYTES_PER_SAMPLE, 32);
  header.writeUInt16LE(16, 34);
  header.write('data', 36, 'ascii');
  header.writeUInt32LE(pcm.length, 40);

  return Buffer.concat([header, pcm]);
}

function writeFlacTotalSamples({ buffer, samples }) {
  const streamInfoOffset = 8;
  const totalSamplesOffset = streamInfoOffset + 13;

  if (buffer.toString('latin1', 0, 4) !== 'fLaC' || (buffer[4] & 0x7f) !== 0) {
    return buffer;
  }

  buffer[totalSamplesOffset] =
    (buffer[totalSamplesOffset] & 0xf0) |
    (Math.floor(samples / 2 ** 32) & 0x0f);
  buffer.writeUInt32BE(samples % 2 ** 32, totalSamplesOffset + 1);

  return buffer;
}

export async function encodePcmAudioIntegration({ pcm, sampleRate, format }) {
  const samples = Math.floor(pcm.length / BYTES_PER_SAMPLE);
  const evenPcm = pcm.subarray(0, samples * BYTES_PER_SAMPLE);
  const durationSeconds = samples / sampleRate;
  const contentType = AUDIO_FORMAT_CONTENT_TYPE[format];

  if (format === AUDIO_FORMAT.WAV) {
    return {
      buffer: buildWav({ pcm: evenPcm, sampleRate }),
      contentType,
      extension: 'wav',
      durationSeconds,
    };
  }

  const output = FFMPEG_OUTPUTS[format];

  if (!output) {
    throw new Error(`Unsupported audio format: ${format}`);
  }

  const buffer = await runFfmpegIntegration({
    args: [
      '-hide_banner',
      '-loglevel',
      'error',
      '-f',
      's16le',
      '-ar',
      String(sampleRate),
      '-ac',
      '1',
      '-i',
      'pipe:0',
      ...output.args,
      'pipe:1',
    ],
    input: evenPcm,
  });

  return {
    buffer:
      format === AUDIO_FORMAT.FLAC
        ? writeFlacTotalSamples({ buffer, samples })
        : buffer,
    contentType,
    extension: output.extension,
    durationSeconds,
  };
}
