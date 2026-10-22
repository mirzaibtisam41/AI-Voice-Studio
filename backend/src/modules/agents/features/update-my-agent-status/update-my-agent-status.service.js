import { NotFoundError } from '#src/utils/index.js';
import { updateUserAgentRepository } from '#src/modules/agents/shared/repositories/index.js';

export async function updateMyAgentStatusService({ userId, agentId, status }) {
  const agent = await updateUserAgentRepository({
    userId,
    agentId,
    changes: { status },
  });

  if (!agent) {
    throw new NotFoundError('Agent not found');
  }

  return agent;
}
