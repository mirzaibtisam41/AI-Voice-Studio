import { buildAiModelResponseUtil } from '#src/modules/ai-models/shared/utils/index.js';
import { getAiModelService } from '#src/modules/ai-models/features/get-ai-model/get-ai-model.service.js';

export async function getAiModelController(request, reply) {
  const model = await getAiModelService({ id: request.params.id });

  return reply.success({
    data: { model: buildAiModelResponseUtil({ model }) },
  });
}
