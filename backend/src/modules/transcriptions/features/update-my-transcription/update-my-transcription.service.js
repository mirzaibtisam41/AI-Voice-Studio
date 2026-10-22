import { NotFoundError } from '#src/utils/index.js';
import { updateUserTranscriptionOutputRepository } from '#src/modules/transcriptions/shared/repositories/index.js';
import { presentTranscriptionsService } from '#src/modules/transcriptions/shared/services/index.js';

export async function updateMyTranscriptionService({
  userId,
  transcriptionId,
  text,
}) {
  const updated = await updateUserTranscriptionOutputRepository({
    userId,
    transcriptionId,
    output: { editedTranscriptText: text.trim() },
  });

  if (!updated) {
    throw new NotFoundError('Transcript not found');
  }

  const [transcription] = await presentTranscriptionsService({
    userId,
    transcriptions: [updated],
  });

  return transcription;
}
