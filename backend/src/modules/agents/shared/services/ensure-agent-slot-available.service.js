import { ConflictError } from '#src/utils/index.js';
import { AGENTS_PER_USER_MAX } from '#src/modules/agents/agent.constants.js';
import { countUserAgentsRepository } from '#src/modules/agents/shared/repositories/index.js';

export async function ensureAgentSlotAvailableService({ userId }) {
  const total = await countUserAgentsRepository({ userId });

  if (total >= AGENTS_PER_USER_MAX) {
    throw new ConflictError(
      `You can have up to ${AGENTS_PER_USER_MAX} agents. Delete one to create another.`,
    );
  }
}
