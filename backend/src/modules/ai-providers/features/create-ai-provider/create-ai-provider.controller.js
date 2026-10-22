import { StatusCodes } from 'http-status-codes';
import { createAiProviderService } from '#src/modules/ai-providers/features/create-ai-provider/create-ai-provider.service.js';

export async function createAiProviderController(request, reply) {
  const provider = await createAiProviderService({
    actor: request.user,
    data: request.body,
  });

  return reply.success({
    data: { provider: { ...provider.toJSON(), modelsCount: 0 } },
    message: 'Provider created',
    statusCode: StatusCodes.CREATED,
  });
}
