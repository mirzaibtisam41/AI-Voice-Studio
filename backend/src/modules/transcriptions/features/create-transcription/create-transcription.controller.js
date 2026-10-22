import { StatusCodes } from 'http-status-codes';
import { createTranscriptionService } from '#src/modules/transcriptions/features/create-transcription/create-transcription.service.js';

export async function createTranscriptionController(request, reply) {
  const result = await createTranscriptionService({
    server: request.server,
    log: request.log,
    userId: request.user._id,
    data: request.body,
  });

  return reply.success({
    data: result,
    message: 'Transcript ready',
    statusCode: StatusCodes.CREATED,
  });
}
