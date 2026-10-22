import { deleteMyTranscriptionService } from '#src/modules/transcriptions/features/delete-my-transcription/delete-my-transcription.service.js';

export async function deleteMyTranscriptionController(request, reply) {
  await deleteMyTranscriptionService({
    userId: request.user._id,
    transcriptionId: request.params.id,
  });

  return reply.success({ message: 'Transcript deleted' });
}
