import { StatusCodes } from 'http-status-codes';
import { buildAiModelResponseUtil } from '#src/modules/ai-models/shared/utils/index.js';
import { createAiModelService } from '#src/modules/ai-models/features/create-ai-model/create-ai-model.service.js';

export async function createAiModelController(request, reply) {
  const model = await createAiModelService({
    actor: request.user,
    data: request.body,
  });

  return reply.success({
    data: { model: buildAiModelResponseUtil({ model }) },
    message: 'Model created',
    statusCode: StatusCodes.CREATED,
  });
}
