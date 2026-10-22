import { NotFoundError } from '#src/utils/index.js';
import { updateUserAudioFileRepository } from '#src/modules/audio-files/shared/repositories/index.js';
import { presentAudioFileService } from '#src/modules/audio-files/shared/services/index.js';

export async function updateMyAudioFileService({
  storage,
  userId,
  audioFileId,
  title,
  favorite,
}) {
  const changes = {};

  if (title !== undefined) changes.title = title.trim();
  if (favorite !== undefined) changes.favorite = favorite;

  const audioFile = await updateUserAudioFileRepository({
    userId,
    audioFileId,
    changes,
  });

  if (!audioFile) {
    throw new NotFoundError('Audio file not found');
  }

  return presentAudioFileService({ storage, audioFile });
}
