import { StatusCodes } from 'http-status-codes';
import { chatWithAgentService } from '#src/modules/agents/features/chat-with-agent/chat-with-agent.service.js';

export async function chatWithAgentController(request, reply) {
  const result = await chatWithAgentService({
    server: request.server,
    log: request.log,
    userId: request.user._id,
    agentId: request.params.id,
    data: request.body,
  });

  return reply.success({
    data: result,
    message: 'Agent replied',
    statusCode: StatusCodes.CREATED,
  });
}
