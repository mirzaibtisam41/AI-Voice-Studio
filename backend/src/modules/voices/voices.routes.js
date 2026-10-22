import {
  checkUserIsAdminHook,
  checkUserIsLoggedInHook,
} from '#src/hooks/index.js';
import { listAvailableVoicesController } from '#src/modules/voices/features/list-available-voices/list-available-voices.controller.js';
import { listVoicesController } from '#src/modules/voices/features/list-voices/list-voices.controller.js';
import { updateVoiceController } from '#src/modules/voices/features/update-voice/update-voice.controller.js';
import { updateVoiceSchema } from '#src/modules/voices/features/update-voice/update-voice.schema.js';

export async function voicesRoutes(fastify) {
  fastify.addHook('onRequest', checkUserIsLoggedInHook);

  fastify.get('/', listAvailableVoicesController);
}

export async function adminVoicesRoutes(fastify) {
  fastify.addHook('onRequest', checkUserIsLoggedInHook);
  fastify.addHook('onRequest', checkUserIsAdminHook);

  fastify.get('/', listVoicesController);
  fastify.patch('/:id', { schema: updateVoiceSchema }, updateVoiceController);
}
