import { AudioFileModel } from '#src/modules/audio-files/audio-file.model.js';

export function updateUserAudioFileRepository({
  session,
  userId,
  audioFileId,
  changes,
}) {
  return AudioFileModel.findOneAndUpdate(
    { _id: audioFileId, userId },
    { $set: changes },
    { returnDocument: 'after', runValidators: true, session: session ?? null },
  );
}
