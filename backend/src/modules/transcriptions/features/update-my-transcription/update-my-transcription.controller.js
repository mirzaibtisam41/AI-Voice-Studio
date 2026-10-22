import { updateMyTranscriptionService } from '#src/modules/transcriptions/features/update-my-transcription/update-my-transcription.service.js';

export async function updateMyTranscriptionController(request, reply) {
  const transcription = await updateMyTranscriptionService({
    userId: request.user._id,
    transcriptionId: request.params.id,
    text: request.body.text,
  });

  return reply.success({
    data: { transcription },
    message: 'Transcript saved',
  });
}
