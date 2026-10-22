import { AgentModel } from '#src/modules/agents/agent.model.js';

export function countUserAgentsRepository({ userId, status }) {
  const filter = { userId };

  if (status) filter.status = status;

  return AgentModel.countDocuments(filter);
}
