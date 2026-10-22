import { AudioFileModel } from '#src/modules/audio-files/audio-file.model.js';

export async function createAudioFileRepository({ session, data }) {
  const [audioFile] = await AudioFileModel.create([data], { session });

  return audioFile;
}
