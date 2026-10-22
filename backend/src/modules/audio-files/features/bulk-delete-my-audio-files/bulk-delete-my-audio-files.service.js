import {
  deleteUserAudioFilesByIdsRepository,
  listUserAudioFilesByIdsRepository,
} from '#src/modules/audio-files/shared/repositories/index.js';
import { deleteAudioFileObjectsService } from '#src/modules/audio-files/shared/services/index.js';

export async function bulkDeleteMyAudioFilesService({
  storage,
  log,
  userId,
  ids,
}) {
  const audioFiles = await listUserAudioFilesByIdsRepository({ userId, ids });

  if (audioFiles.length === 0) return [];

  const ownedIds = audioFiles.map((audioFile) => audioFile._id);

  await deleteAudioFileObjectsService({
    storage,
    log,
    keys: audioFiles.map((audioFile) => audioFile.storageKey),
  });
  await deleteUserAudioFilesByIdsRepository({ userId, ids: ownedIds });

  return ownedIds.map((id) => id.toString());
}
