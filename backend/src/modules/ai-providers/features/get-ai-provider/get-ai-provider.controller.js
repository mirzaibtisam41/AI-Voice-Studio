import { getAiProviderService } from '#src/modules/ai-providers/features/get-ai-provider/get-ai-provider.service.js';

export async function getAiProviderController(request, reply) {
  const provider = await getAiProviderService({ id: request.params.id });

  return reply.success({ data: { provider } });
}
