import { parseBuffer } from 'music-metadata';
import { UnsupportedMediaTypeError } from '#src/utils/index.js';
import { AUDIO_FORMAT_CONTENT_TYPE } from '#src/modules/audio-files/audio-file.constants.js';
import { detectAudioContainerIntegration } from '#src/integrations/audio/detect-audio-container.integration.js';
import { measureAudioDurationIntegration } from '#src/integrations/audio/measure-audio-duration.integration.js';

const UNSUPPORTED_MESSAGE =
  'Use an MP3, WAV, M4A, WebM, OGG or FLAC audio file';

function isValidDuration(durationSeconds) {
  return Number.isFinite(durationSeconds) && durationSeconds > 0;
}

export async function readAudioMetadataIntegration({ buffer }) {
  const format = detectAudioContainerIntegration({ buffer });

  if (!format) {
    throw new UnsupportedMediaTypeError(UNSUPPORTED_MESSAGE);
  }

  let metadata;

  try {
    metadata = await parseBuffer(
      buffer,
      { mimeType: AUDIO_FORMAT_CONTENT_TYPE[format], size: buffer.length },
      { duration: true, skipCovers: true },
    );
  } catch {
    throw new UnsupportedMediaTypeError(UNSUPPORTED_MESSAGE);
  }

  let durationSeconds = metadata.format.duration;

  if (!isValidDuration(durationSeconds)) {
    durationSeconds = await measureAudioDurationIntegration({ buffer });
  }

  if (!isValidDuration(durationSeconds)) {
    throw new UnsupportedMediaTypeError(
      'We could not read the length of this audio file',
    );
  }

  return { durationSeconds, format };
}
