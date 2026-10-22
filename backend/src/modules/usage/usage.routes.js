import { checkUserIsLoggedInHook } from '#src/hooks/index.js';
import { getMyUsageController } from '#src/modules/usage/features/get-my-usage/get-my-usage.controller.js';
import { getMyUsageSchema } from '#src/modules/usage/features/get-my-usage/get-my-usage.schema.js';

export async function usageRoutes(fastify) {
  fastify.addHook('onRequest', checkUserIsLoggedInHook);

  fastify.get('/', { schema: getMyUsageSchema }, getMyUsageController);
}
