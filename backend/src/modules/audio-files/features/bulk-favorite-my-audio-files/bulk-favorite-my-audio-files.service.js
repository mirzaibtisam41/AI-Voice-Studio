import {
  listUserAudioFilesByIdsRepository,
  updateUserAudioFilesFavoriteRepository,
} from '#src/modules/audio-files/shared/repositories/index.js';

export async function bulkFavoriteMyAudioFilesService({
  userId,
  ids,
  favorite,
}) {
  const audioFiles = await listUserAudioFilesByIdsRepository({ userId, ids });

  if (audioFiles.length === 0) return [];

  const ownedIds = audioFiles.map((audioFile) => audioFile._id);

  await updateUserAudioFilesFavoriteRepository({
    userId,
    ids: ownedIds,
    favorite,
  });

  return ownedIds.map((id) => id.toString());
}
