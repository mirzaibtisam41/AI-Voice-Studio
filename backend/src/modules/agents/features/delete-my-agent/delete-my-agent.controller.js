import { deleteMyAgentService } from '#src/modules/agents/features/delete-my-agent/delete-my-agent.service.js';

export async function deleteMyAgentController(request, reply) {
  await deleteMyAgentService({
    userId: request.user._id,
    agentId: request.params.id,
  });

  return reply.success({ message: 'Agent deleted' });
}
