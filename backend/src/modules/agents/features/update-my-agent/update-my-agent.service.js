import { NotFoundError } from '#src/utils/index.js';
import { updateUserAgentRepository } from '#src/modules/agents/shared/repositories/index.js';
import {
  ensureEnabledVoiceService,
  findMyAgentService,
} from '#src/modules/agents/shared/services/index.js';
import {
  buildDefaultGreetingUtil,
  normalizeAgentFieldsUtil,
} from '#src/modules/agents/shared/utils/index.js';

export async function updateMyAgentService({ userId, agentId, data }) {
  const agent = await findMyAgentService({ userId, agentId });
  const changes = normalizeAgentFieldsUtil({ data });

  if (changes.voiceCode && changes.voiceCode !== agent.voiceCode) {
    await ensureEnabledVoiceService({ voiceCode: changes.voiceCode });
  }

  if (changes.greeting === null) {
    changes.greeting = buildDefaultGreetingUtil({
      name: changes.name ?? agent.name,
    });
  }

  const updated = await updateUserAgentRepository({
    userId,
    agentId,
    changes,
  });

  if (!updated) {
    throw new NotFoundError('Agent not found');
  }

  return updated;
}
