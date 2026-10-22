import {
  checkUserIsAdminHook,
  checkUserIsLoggedInHook,
} from '#src/hooks/index.js';
import { objectIdParamsSchema } from '#src/shared/schemas/index.js';
import { getAdminGenerationController } from '#src/modules/generations/features/get-admin-generation/get-admin-generation.controller.js';
import { getGenerationStatsController } from '#src/modules/generations/features/get-generation-stats/get-generation-stats.controller.js';
import { getMyGenerationController } from '#src/modules/generations/features/get-my-generation/get-my-generation.controller.js';
import { listAdminGenerationsController } from '#src/modules/generations/features/list-admin-generations/list-admin-generations.controller.js';
import { listAdminGenerationsSchema } from '#src/modules/generations/features/list-admin-generations/list-admin-generations.schema.js';
import { listMyGenerationsController } from '#src/modules/generations/features/list-my-generations/list-my-generations.controller.js';
import { listMyGenerationsSchema } from '#src/modules/generations/features/list-my-generations/list-my-generations.schema.js';
import { refundGenerationController } from '#src/modules/generations/features/refund-generation/refund-generation.controller.js';
import { refundGenerationSchema } from '#src/modules/generations/features/refund-generation/refund-generation.schema.js';

export async function generationsRoutes(fastify) {
  fastify.addHook('onRequest', checkUserIsLoggedInHook);

  fastify.get(
    '/',
    { schema: listMyGenerationsSchema },
    listMyGenerationsController,
  );

  fastify.get(
    '/:id',
    { schema: { params: objectIdParamsSchema('id') } },
    getMyGenerationController,
  );
}

export async function adminGenerationsRoutes(fastify) {
  fastify.addHook('onRequest', checkUserIsLoggedInHook);
  fastify.addHook('onRequest', checkUserIsAdminHook);

  fastify.get(
    '/',
    { schema: listAdminGenerationsSchema },
    listAdminGenerationsController,
  );

  fastify.get('/stats', getGenerationStatsController);

  fastify.get(
    '/:id',
    { schema: { params: objectIdParamsSchema('id') } },
    getAdminGenerationController,
  );

  fastify.post(
    '/:id/refund',
    { schema: refundGenerationSchema },
    refundGenerationController,
  );
}
