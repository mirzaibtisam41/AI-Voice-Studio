import { buildAiModelResponseUtil } from '#src/modules/ai-models/shared/utils/index.js';
import { saveAiModelCapabilityService } from '#src/modules/ai-models/features/save-ai-model-capability/save-ai-model-capability.service.js';

export async function saveAiModelCapabilityController(request, reply) {
  const model = await saveAiModelCapabilityService({
    actor: request.user,
    id: request.params.id,
    code: request.params.code,
    data: request.body,
  });

  return reply.success({
    data: { model: buildAiModelResponseUtil({ model }) },
    message: 'Capability saved',
  });
}
