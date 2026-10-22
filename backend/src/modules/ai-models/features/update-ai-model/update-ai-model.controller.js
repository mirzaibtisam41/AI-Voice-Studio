import { buildAiModelResponseUtil } from '#src/modules/ai-models/shared/utils/index.js';
import { updateAiModelService } from '#src/modules/ai-models/features/update-ai-model/update-ai-model.service.js';

export async function updateAiModelController(request, reply) {
  const model = await updateAiModelService({
    actor: request.user,
    id: request.params.id,
    data: request.body,
  });

  return reply.success({
    data: { model: buildAiModelResponseUtil({ model }) },
    message: 'Model updated',
  });
}
