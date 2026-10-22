import { StatusCodes } from 'http-status-codes';
import { duplicateMyAgentService } from '#src/modules/agents/features/duplicate-my-agent/duplicate-my-agent.service.js';

export async function duplicateMyAgentController(request, reply) {
  const agent = await duplicateMyAgentService({
    userId: request.user._id,
    agentId: request.params.id,
  });

  return reply.success({
    data: { agent },
    message: 'Agent duplicated',
    statusCode: StatusCodes.CREATED,
  });
}
