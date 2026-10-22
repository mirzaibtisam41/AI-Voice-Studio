import { getMyTranscriptionService } from '#src/modules/transcriptions/features/get-my-transcription/get-my-transcription.service.js';

export async function getMyTranscriptionController(request, reply) {
  const transcription = await getMyTranscriptionService({
    userId: request.user._id,
    transcriptionId: request.params.id,
  });

  return reply.success({ data: { transcription } });
}
