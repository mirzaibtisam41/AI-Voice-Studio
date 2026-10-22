import { getMyGenerationService } from '#src/modules/generations/features/get-my-generation/get-my-generation.service.js';

export async function getMyGenerationController(request, reply) {
  const generation = await getMyGenerationService({
    userId: request.user._id,
    generationId: request.params.id,
  });

  return reply.success({ data: { generation } });
}
