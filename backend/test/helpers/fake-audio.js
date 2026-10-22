import { AUDIO_FORMAT_CONTENT_TYPE } from '#src/modules/audio-files/audio-file.constants.js';

export function createFakeAudio({ durationSeconds = 90 } = {}) {
  return {
    async encodePcm({ pcm, sampleRate, format }) {
      return {
        buffer: Buffer.from(`fake-${format}-${pcm.length}`),
        contentType: AUDIO_FORMAT_CONTENT_TYPE[format],
        extension: format === 'opus' ? 'ogg' : format,
        durationSeconds: pcm.length / (sampleRate * 2),
      };
    },

    async readMetadata({ fileName }) {
      return {
        durationSeconds,
        format: fileName?.split('.').pop()?.toLowerCase() ?? 'mp3',
      };
    },
  };
}
