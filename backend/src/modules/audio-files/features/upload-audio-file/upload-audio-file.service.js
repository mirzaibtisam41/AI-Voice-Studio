import mongoose from 'mongoose';
import {
  PayloadTooLargeError,
  UnsupportedMediaTypeError,
} from '#src/utils/index.js';
import {
  AUDIO_FILE_DEFAULT_UPLOAD_TITLE,
  AUDIO_FILE_KIND,
  AUDIO_FILE_TITLE_MAX_LENGTH,
  AUDIO_FORMAT_CONTENT_TYPE,
  AUDIO_STORAGE_FOLDER,
  UPLOAD_FORMATS,
} from '#src/modules/audio-files/audio-file.constants.js';
import { createAudioFileRepository } from '#src/modules/audio-files/shared/repositories/index.js';
import {
  deleteAudioFileObjectsService,
  presentAudioFileService,
} from '#src/modules/audio-files/shared/services/index.js';
import { buildAudioStorageKeyUtil } from '#src/modules/audio-files/shared/utils/index.js';
import { getPlatformSettingsService } from '#src/modules/platform-settings/shared/services/index.js';

function buildTitle({ title, fileName }) {
  const chosen =
    title?.trim() || fileName?.replace(/\.[^.]+$/, '').trim() || '';

  return (
    chosen.slice(0, AUDIO_FILE_TITLE_MAX_LENGTH).trim() ||
    AUDIO_FILE_DEFAULT_UPLOAD_TITLE
  );
}

export async function uploadAudioFileService({
  storage,
  audio,
  log,
  userId,
  buffer,
  fileName,
  contentType,
  title,
}) {
  const settings = await getPlatformSettingsService();

  if (buffer.length > settings.uploadMaxMegabytes * 1024 * 1024) {
    throw new PayloadTooLargeError(
      `Use an audio file under ${settings.uploadMaxMegabytes} MB`,
    );
  }

  const metadata = await audio.readMetadata({ buffer, fileName, contentType });

  if (!UPLOAD_FORMATS.includes(metadata.format)) {
    throw new UnsupportedMediaTypeError(
      'Use an MP3, WAV, M4A, WebM, OGG or FLAC audio file',
    );
  }

  const audioFileId = new mongoose.Types.ObjectId();
  const storageKey = buildAudioStorageKeyUtil({
    userId,
    folder: AUDIO_STORAGE_FOLDER.UPLOADS,
    audioFileId,
    extension: metadata.format,
  });
  const storedContentType = AUDIO_FORMAT_CONTENT_TYPE[metadata.format];

  await storage.uploadFile({
    key: storageKey,
    body: buffer,
    contentType: storedContentType,
  });

  let audioFile;

  try {
    audioFile = await createAudioFileRepository({
      data: {
        _id: audioFileId,
        userId,
        kind: AUDIO_FILE_KIND.UPLOADED,
        title: buildTitle({ title, fileName }),
        storageKey,
        contentType: storedContentType,
        format: metadata.format,
        sizeBytes: buffer.length,
        durationSeconds: metadata.durationSeconds,
      },
    });
  } catch (error) {
    await deleteAudioFileObjectsService({ storage, log, keys: [storageKey] });
    throw error;
  }

  return presentAudioFileService({ storage, audioFile });
}
