import { AudioFileModel } from '#src/modules/audio-files/audio-file.model.js';

export function findUserAudioFileByIdRepository({
  session,
  userId,
  audioFileId,
}) {
  return AudioFileModel.findOne({ _id: audioFileId, userId }).session(
    session ?? null,
  );
}
