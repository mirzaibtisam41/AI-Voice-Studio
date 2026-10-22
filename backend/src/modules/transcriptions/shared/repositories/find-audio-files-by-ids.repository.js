import { AudioFileModel } from '#src/modules/audio-files/audio-file.model.js';

export function findAudioFilesByIdsRepository({ userId, audioFileIds }) {
  return AudioFileModel.find({ _id: { $in: audioFileIds }, userId })
    .select('title')
    .lean();
}
