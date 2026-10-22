import { AudioFileModel } from '#src/modules/audio-files/audio-file.model.js';

export function listUserAudioFilesByIdsRepository({ userId, ids }) {
  return AudioFileModel.find({ _id: { $in: ids }, userId }).select(
    '_id storageKey',
  );
}
