import { getAdminGenerationService } from '#src/modules/generations/features/get-admin-generation/get-admin-generation.service.js';

export async function getAdminGenerationController(request, reply) {
  const generation = await getAdminGenerationService({
    generationId: request.params.id,
  });

  return reply.success({ data: { generation } });
}
