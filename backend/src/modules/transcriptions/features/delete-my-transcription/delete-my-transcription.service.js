import { NotFoundError } from '#src/utils/index.js';
import {
  existsAudioFileTranscriptRepository,
  updateAudioFileHasTranscriptRepository,
  updateUserTranscriptionOutputRepository,
} from '#src/modules/transcriptions/shared/repositories/index.js';

export async function deleteMyTranscriptionService({
  userId,
  transcriptionId,
}) {
  const deleted = await updateUserTranscriptionOutputRepository({
    userId,
    transcriptionId,
    output: {
      transcriptText: null,
      editedTranscriptText: null,
      languages: [],
    },
  });

  if (!deleted) {
    throw new NotFoundError('Transcript not found');
  }

  const audioFileId = deleted.input?.sourceAudioFileId;

  if (audioFileId) {
    const hasTranscript = await existsAudioFileTranscriptRepository({
      userId,
      audioFileId,
    });

    await updateAudioFileHasTranscriptRepository({
      userId,
      audioFileId,
      hasTranscript,
    });
  }
}
