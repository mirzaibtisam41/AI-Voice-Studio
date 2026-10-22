import {
  AGENT_COPY_SUFFIX,
  AGENT_NAME_MAX_LENGTH,
  AGENT_STATUS,
} from '#src/modules/agents/agent.constants.js';
import { createAgentRepository } from '#src/modules/agents/shared/repositories/index.js';
import {
  ensureAgentSlotAvailableService,
  findMyAgentService,
} from '#src/modules/agents/shared/services/index.js';

function buildCopyName({ name }) {
  const room = AGENT_NAME_MAX_LENGTH - AGENT_COPY_SUFFIX.length;

  return `${name.slice(0, room).trim()}${AGENT_COPY_SUFFIX}`;
}

export async function duplicateMyAgentService({ userId, agentId }) {
  const agent = await findMyAgentService({ userId, agentId });

  await ensureAgentSlotAvailableService({ userId });

  return createAgentRepository({
    data: {
      userId,
      name: buildCopyName({ name: agent.name }),
      description: agent.description,
      voiceCode: agent.voiceCode,
      greeting: agent.greeting,
      instructions: agent.instructions,
      responseStyle: agent.responseStyle,
      tools: [...agent.tools],
      knowledge: agent.knowledge,
      status: AGENT_STATUS.DRAFT,
    },
  });
}
