import { AgentModel } from '#src/modules/agents/agent.model.js';

export function deleteUserAgentRepository({ userId, agentId }) {
  return AgentModel.findOneAndDelete({ _id: agentId, userId });
}
