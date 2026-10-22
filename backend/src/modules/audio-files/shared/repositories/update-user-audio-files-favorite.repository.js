import { AudioFileModel } from '#src/modules/audio-files/audio-file.model.js';

export function updateUserAudioFilesFavoriteRepository({
  userId,
  ids,
  favorite,
}) {
  return AudioFileModel.updateMany(
    { _id: { $in: ids }, userId },
    { $set: { favorite } },
  );
}
