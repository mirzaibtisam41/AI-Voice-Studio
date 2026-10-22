import { AudioFileModel } from '#src/modules/audio-files/audio-file.model.js';

export function deleteUserAudioFileRepository({
  session,
  userId,
  audioFileId,
}) {
  return AudioFileModel.deleteOne({ _id: audioFileId, userId }).session(
    session ?? null,
  );
}
