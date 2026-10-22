import { CAPABILITY_DETAILS } from '#src/constants/index.js';
import { buildAiModelResponseUtil } from '#src/modules/ai-models/shared/utils/index.js';
import { setAiModelCapabilityDefaultService } from '#src/modules/ai-models/features/set-ai-model-capability-default/set-ai-model-capability-default.service.js';

export async function setAiModelCapabilityDefaultController(request, reply) {
  const { id, code } = request.params;
  const model = await setAiModelCapabilityDefaultService({
    actor: request.user,
    id,
    code,
  });

  return reply.success({
    data: { model: buildAiModelResponseUtil({ model }) },
    message: `${model.name} is now the default for ${CAPABILITY_DETAILS[code].label}`,
  });
}
