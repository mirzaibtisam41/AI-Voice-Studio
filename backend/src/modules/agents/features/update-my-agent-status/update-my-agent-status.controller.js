import { updateMyAgentStatusService } from '#src/modules/agents/features/update-my-agent-status/update-my-agent-status.service.js';

export async function updateMyAgentStatusController(request, reply) {
  const agent = await updateMyAgentStatusService({
    userId: request.user._id,
    agentId: request.params.id,
    status: request.body.status,
  });

  return reply.success({ data: { agent }, message: 'Agent status updated' });
}
