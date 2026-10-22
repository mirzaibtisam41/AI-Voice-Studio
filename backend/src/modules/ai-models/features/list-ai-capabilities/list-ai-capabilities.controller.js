import { listAiCapabilitiesService } from '#src/modules/ai-models/features/list-ai-capabilities/list-ai-capabilities.service.js';

export async function listAiCapabilitiesController(request, reply) {
  const capabilities = listAiCapabilitiesService();

  return reply.success({ data: { capabilities } });
}
