import { NotFoundError } from '#src/utils/index.js';
import { deleteUserAgentRepository } from '#src/modules/agents/shared/repositories/index.js';

export async function deleteMyAgentService({ userId, agentId }) {
  const deleted = await deleteUserAgentRepository({ userId, agentId });

  if (!deleted) {
    throw new NotFoundError('Agent not found');
  }
}
