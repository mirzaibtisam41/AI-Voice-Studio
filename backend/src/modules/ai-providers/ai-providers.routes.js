import {
  checkUserIsAdminHook,
  checkUserIsLoggedInHook,
} from '#src/hooks/index.js';
import { objectIdParamsSchema } from '#src/shared/schemas/index.js';
import { createAiProviderController } from '#src/modules/ai-providers/features/create-ai-provider/create-ai-provider.controller.js';
import { createAiProviderSchema } from '#src/modules/ai-providers/features/create-ai-provider/create-ai-provider.schema.js';
import { deleteAiProviderController } from '#src/modules/ai-providers/features/delete-ai-provider/delete-ai-provider.controller.js';
import { getAiProviderController } from '#src/modules/ai-providers/features/get-ai-provider/get-ai-provider.controller.js';
import { listAiProvidersController } from '#src/modules/ai-providers/features/list-ai-providers/list-ai-providers.controller.js';
import { updateAiProviderController } from '#src/modules/ai-providers/features/update-ai-provider/update-ai-provider.controller.js';
import { updateAiProviderSchema } from '#src/modules/ai-providers/features/update-ai-provider/update-ai-provider.schema.js';
import { updateAiProviderStatusController } from '#src/modules/ai-providers/features/update-ai-provider-status/update-ai-provider-status.controller.js';
import { updateAiProviderStatusSchema } from '#src/modules/ai-providers/features/update-ai-provider-status/update-ai-provider-status.schema.js';

export async function aiProvidersRoutes(fastify) {
  fastify.addHook('onRequest', checkUserIsLoggedInHook);
  fastify.addHook('onRequest', checkUserIsAdminHook);

  fastify.post(
    '/',
    { schema: createAiProviderSchema },
    createAiProviderController,
  );
  fastify.get('/', listAiProvidersController);
  fastify.get(
    '/:id',
    { schema: { params: objectIdParamsSchema('id') } },
    getAiProviderController,
  );
  fastify.patch(
    '/:id',
    { schema: updateAiProviderSchema },
    updateAiProviderController,
  );
  fastify.patch(
    '/:id/status',
    { schema: updateAiProviderStatusSchema },
    updateAiProviderStatusController,
  );
  fastify.delete(
    '/:id',
    { schema: { params: objectIdParamsSchema('id') } },
    deleteAiProviderController,
  );
}
