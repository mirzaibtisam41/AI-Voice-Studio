import { AudioFileModel } from '#src/modules/audio-files/audio-file.model.js';

export function deleteUserAudioFilesByIdsRepository({ userId, ids }) {
  return AudioFileModel.deleteMany({ _id: { $in: ids }, userId });
}
