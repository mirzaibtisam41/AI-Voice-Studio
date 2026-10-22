import { NotFoundError } from '#src/utils/index.js';
import { findUserAgentByIdRepository } from '#src/modules/agents/shared/repositories/index.js';

export async function findMyAgentService({ userId, agentId }) {
  const agent = await findUserAgentByIdRepository({ userId, agentId });

  if (!agent) {
    throw new NotFoundError('Agent not found');
  }

  return agent;
}
