import { getMyAgentService } from '#src/modules/agents/features/get-my-agent/get-my-agent.service.js';

export async function getMyAgentController(request, reply) {
  const agent = await getMyAgentService({
    userId: request.user._id,
    agentId: request.params.id,
  });

  return reply.success({ data: { agent } });
}
