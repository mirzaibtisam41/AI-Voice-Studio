import { AI_PROVIDER_STATUS } from '#src/modules/ai-providers/ai-provider.constants.js';
import { updateAiProviderStatusService } from '#src/modules/ai-providers/features/update-ai-provider-status/update-ai-provider-status.service.js';

export async function updateAiProviderStatusController(request, reply) {
  const provider = await updateAiProviderStatusService({
    actor: request.user,
    id: request.params.id,
    status: request.body.status,
  });

  return reply.success({
    data: { provider },
    message:
      provider.status === AI_PROVIDER_STATUS.ACTIVE
        ? 'Provider activated'
        : 'Provider disabled',
  });
}
