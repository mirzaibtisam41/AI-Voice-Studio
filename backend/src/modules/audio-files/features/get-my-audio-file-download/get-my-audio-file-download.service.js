import { NotFoundError } from '#src/utils/index.js';
import { findUserAudioFileByIdRepository } from '#src/modules/audio-files/shared/repositories/index.js';
import { buildAudioDownloadFileNameUtil } from '#src/modules/audio-files/shared/utils/index.js';

export async function getMyAudioFileDownloadService({
  storage,
  userId,
  audioFileId,
}) {
  const audioFile = await findUserAudioFileByIdRepository({
    userId,
    audioFileId,
  });

  if (!audioFile) {
    throw new NotFoundError('Audio file not found');
  }

  return storage.createSignedUrl({
    key: audioFile.storageKey,
    downloadFileName: buildAudioDownloadFileNameUtil({ audioFile }),
  });
}
