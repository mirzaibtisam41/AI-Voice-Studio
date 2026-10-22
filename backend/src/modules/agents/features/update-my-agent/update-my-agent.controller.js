import { updateMyAgentService } from '#src/modules/agents/features/update-my-agent/update-my-agent.service.js';

export async function updateMyAgentController(request, reply) {
  const agent = await updateMyAgentService({
    userId: request.user._id,
    agentId: request.params.id,
    data: request.body,
  });

  return reply.success({ data: { agent }, message: 'Agent saved' });
}
