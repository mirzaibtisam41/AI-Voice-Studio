import { AgentModel } from '#src/modules/agents/agent.model.js';

export function findUserAgentByIdRepository({ userId, agentId }) {
  return AgentModel.findOne({ _id: agentId, userId });
}
