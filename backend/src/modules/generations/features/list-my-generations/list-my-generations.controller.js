import { listMyGenerationsService } from '#src/modules/generations/features/list-my-generations/list-my-generations.service.js';

export async function listMyGenerationsController(request, reply) {
  const { generations, counts, meta } = await listMyGenerationsService({
    userId: request.user._id,
    query: request.query,
  });

  return reply.success({ data: { generations, counts }, meta });
}
