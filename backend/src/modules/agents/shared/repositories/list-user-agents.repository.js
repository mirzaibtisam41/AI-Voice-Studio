import { AgentModel } from '#src/modules/agents/agent.model.js';

export function listUserAgentsRepository({ userId, status, skip, limit }) {
  const filter = { userId };

  if (status) filter.status = status;

  return AgentModel.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
}
