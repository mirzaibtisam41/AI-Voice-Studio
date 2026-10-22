import { NotFoundError } from '#src/utils/index.js';
import { findUserTranscriptionByIdRepository } from '#src/modules/transcriptions/shared/repositories/index.js';

export async function findMyTranscriptionService({ userId, transcriptionId }) {
  const transcription = await findUserTranscriptionByIdRepository({
    userId,
    transcriptionId,
  });

  if (!transcription) {
    throw new NotFoundError('Transcript not found');
  }

  return transcription;
}
