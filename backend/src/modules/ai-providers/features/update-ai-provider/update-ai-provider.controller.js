import { updateAiProviderService } from '#src/modules/ai-providers/features/update-ai-provider/update-ai-provider.service.js';

export async function updateAiProviderController(request, reply) {
  const provider = await updateAiProviderService({
    actor: request.user,
    id: request.params.id,
    data: request.body,
  });

  return reply.success({ data: { provider }, message: 'Provider updated' });
}
