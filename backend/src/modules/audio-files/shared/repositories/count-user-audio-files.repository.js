import { AudioFileModel } from '#src/modules/audio-files/audio-file.model.js';

export function countUserAudioFilesRepository({ filter }) {
  return AudioFileModel.countDocuments(filter);
}
