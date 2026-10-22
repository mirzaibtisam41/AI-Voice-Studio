import { NotFoundError } from '#src/utils/index.js';
import { findUserAudioFileByIdRepository } from '#src/modules/audio-files/shared/repositories/index.js';
import { presentAudioFileService } from '#src/modules/audio-files/shared/services/index.js';

export async function getMyAudioFileService({ storage, userId, audioFileId }) {
  const audioFile = await findUserAudioFileByIdRepository({
    userId,
    audioFileId,
  });

  if (!audioFile) {
    throw new NotFoundError('Audio file not found');
  }

  return presentAudioFileService({ storage, audioFile });
}
