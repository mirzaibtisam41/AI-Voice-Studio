import { NotFoundError } from '#src/utils/index.js';
import {
  deleteUserAudioFileRepository,
  findUserAudioFileByIdRepository,
} from '#src/modules/audio-files/shared/repositories/index.js';

export async function deleteMyAudioFileService({
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

  await storage.deleteFile({ key: audioFile.storageKey });
  await deleteUserAudioFileRepository({ userId, audioFileId });
}
