import { listMyAgentsService } from '#src/modules/agents/features/list-my-agents/list-my-agents.service.js';

export async function listMyAgentsController(request, reply) {
  const { agents, meta } = await listMyAgentsService({
    userId: request.user._id,
    query: request.query,
  });

  return reply.success({ data: { agents }, meta });
}
