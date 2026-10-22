import { StatusCodes } from 'http-status-codes';
import { createAgentService } from '#src/modules/agents/features/create-agent/create-agent.service.js';

export async function createAgentController(request, reply) {
  const agent = await createAgentService({
    userId: request.user._id,
    data: request.body,
  });

  return reply.success({
    data: { agent },
    message: 'Agent created',
    statusCode: StatusCodes.CREATED,
  });
}
