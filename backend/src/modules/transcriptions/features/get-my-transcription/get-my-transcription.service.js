import {
  findMyTranscriptionService,
  presentTranscriptionsService,
} from '#src/modules/transcriptions/shared/services/index.js';

export async function getMyTranscriptionService({ userId, transcriptionId }) {
  const transcription = await findMyTranscriptionService({
    userId,
    transcriptionId,
  });
  const [presented] = await presentTranscriptionsService({
    userId,
    transcriptions: [transcription],
  });

  return presented;
}
