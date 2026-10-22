import { checkUserIsLoggedInHook } from '#src/hooks/index.js';
import { createSpeechController } from '#src/modules/speech/features/create-speech/create-speech.controller.js';
import { createSpeechSchema } from '#src/modules/speech/features/create-speech/create-speech.schema.js';
import { getSpeechOptionsController } from '#src/modules/speech/features/get-speech-options/get-speech-options.controller.js';
import { getVoicePreviewController } from '#src/modules/speech/features/get-voice-preview/get-voice-preview.controller.js';
import { getVoicePreviewSchema } from '#src/modules/speech/features/get-voice-preview/get-voice-preview.schema.js';

export async function speechRoutes(fastify) {
  fastify.addHook('onRequest', checkUserIsLoggedInHook);

  fastify.get('/options', getSpeechOptionsController);

  fastify.post(
    '/',
    {
      schema: createSpeechSchema,
      config: { rateLimit: { max: 10, timeWindow: 60000 } },
    },
    createSpeechController,
  );

  fastify.get(
    '/voices/:voiceId/preview',
    {
      schema: getVoicePreviewSchema,
      config: { rateLimit: { max: 20, timeWindow: 60000 } },
    },
    getVoicePreviewController,
  );
}
