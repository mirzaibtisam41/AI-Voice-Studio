import { StatusCodes } from 'http-status-codes';
import { createSpeechService } from '#src/modules/speech/features/create-speech/create-speech.service.js';

export async function createSpeechController(request, reply) {
  const result = await createSpeechService({
    server: request.server,
    log: request.log,
    userId: request.user._id,
    data: request.body,
  });

  return reply.success({
    data: result,
    message: 'Speech generated',
    statusCode: StatusCodes.CREATED,
  });
}
