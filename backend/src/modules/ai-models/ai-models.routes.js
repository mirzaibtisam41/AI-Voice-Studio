import {
  checkUserIsAdminHook,
  checkUserIsLoggedInHook,
} from '#src/hooks/index.js';
import { objectIdParamsSchema } from '#src/shared/schemas/index.js';
import { createAiModelController } from '#src/modules/ai-models/features/create-ai-model/create-ai-model.controller.js';
import { createAiModelSchema } from '#src/modules/ai-models/features/create-ai-model/create-ai-model.schema.js';
import { getAiModelController } from '#src/modules/ai-models/features/get-ai-model/get-ai-model.controller.js';
import { listAiCapabilitiesController } from '#src/modules/ai-models/features/list-ai-capabilities/list-ai-capabilities.controller.js';
import { listAiModelsController } from '#src/modules/ai-models/features/list-ai-models/list-ai-models.controller.js';
import { listAiModelsSchema } from '#src/modules/ai-models/features/list-ai-models/list-ai-models.schema.js';
import { saveAiModelCapabilityController } from '#src/modules/ai-models/features/save-ai-model-capability/save-ai-model-capability.controller.js';
import { saveAiModelCapabilitySchema } from '#src/modules/ai-models/features/save-ai-model-capability/save-ai-model-capability.schema.js';
import { setAiModelCapabilityDefaultController } from '#src/modules/ai-models/features/set-ai-model-capability-default/set-ai-model-capability-default.controller.js';
import { setAiModelCapabilityDefaultSchema } from '#src/modules/ai-models/features/set-ai-model-capability-default/set-ai-model-capability-default.schema.js';
import { updateAiModelController } from '#src/modules/ai-models/features/update-ai-model/update-ai-model.controller.js';
import { updateAiModelSchema } from '#src/modules/ai-models/features/update-ai-model/update-ai-model.schema.js';
import { updateAiModelStatusController } from '#src/modules/ai-models/features/update-ai-model-status/update-ai-model-status.controller.js';
import { updateAiModelStatusSchema } from '#src/modules/ai-models/features/update-ai-model-status/update-ai-model-status.schema.js';

export async function aiModelsRoutes(fastify) {
  fastify.addHook('onRequest', checkUserIsLoggedInHook);
  fastify.addHook('onRequest', checkUserIsAdminHook);

  fastify.get('/capabilities', listAiCapabilitiesController);
  fastify.post('/', { schema: createAiModelSchema }, createAiModelController);
  fastify.get('/', { schema: listAiModelsSchema }, listAiModelsController);
  fastify.get(
    '/:id',
    { schema: { params: objectIdParamsSchema('id') } },
    getAiModelController,
  );
  fastify.patch(
    '/:id',
    { schema: updateAiModelSchema },
    updateAiModelController,
  );
  fastify.put(
    '/:id/capabilities/:code',
    { schema: saveAiModelCapabilitySchema },
    saveAiModelCapabilityController,
  );
  fastify.patch(
    '/:id/capabilities/:code/default',
    { schema: setAiModelCapabilityDefaultSchema },
    setAiModelCapabilityDefaultController,
  );
  fastify.patch(
    '/:id/status',
    { schema: updateAiModelStatusSchema },
    updateAiModelStatusController,
  );
}
