import { getSpeechOptionsService } from '#src/modules/speech/features/get-speech-options/get-speech-options.service.js';

export async function getSpeechOptionsController(_request, reply) {
  const options = await getSpeechOptionsService();

  return reply.success({ data: options });
}
