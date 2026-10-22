import { AgentModel } from '#src/modules/agents/agent.model.js';

export function updateUserAgentRepository({ userId, agentId, changes }) {
  return AgentModel.findOneAndUpdate(
    { _id: agentId, userId },
    { $set: changes },
    { returnDocument: 'after', runValidators: true },
  );
}
