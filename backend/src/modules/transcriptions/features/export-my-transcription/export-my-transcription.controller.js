import { exportMyTranscriptionService } from '#src/modules/transcriptions/features/export-my-transcription/export-my-transcription.service.js';

export async function exportMyTranscriptionController(request, reply) {
  const file = await exportMyTranscriptionService({
    userId: request.user._id,
    transcriptionId: request.params.id,
    format: request.query.format,
  });

  return reply
    .header('content-type', file.contentType)
    .header('content-disposition', `attachment; filename="${file.fileName}"`)
    .send(file.body);
}
