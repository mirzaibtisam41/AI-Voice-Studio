import { findMyAgentService } from '#src/modules/agents/shared/services/index.js';

export function getMyAgentService({ userId, agentId }) {
  return findMyAgentService({ userId, agentId });
}
