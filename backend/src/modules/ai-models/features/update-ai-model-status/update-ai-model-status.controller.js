import { buildAiModelResponseUtil } from '#src/modules/ai-models/shared/utils/index.js';
import { updateAiModelStatusService } from '#src/modules/ai-models/features/update-ai-model-status/update-ai-model-status.service.js';

export async function updateAiModelStatusController(request, reply) {
  const model = await updateAiModelStatusService({
    actor: request.user,
    id: request.params.id,
    status: request.body.status,
  });

  return reply.success({
    data: { model: buildAiModelResponseUtil({ model }) },
    message: `Model status changed to ${model.status}`,
  });
}
