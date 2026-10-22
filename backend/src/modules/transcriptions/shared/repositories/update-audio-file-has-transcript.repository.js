import { AudioFileModel } from '#src/modules/audio-files/audio-file.model.js';

export function updateAudioFileHasTranscriptRepository({
  userId,
  audioFileId,
  hasTranscript,
}) {
  return AudioFileModel.updateOne(
    { _id: audioFileId, userId },
    { $set: { hasTranscript } },
  );
}
