import { AgentModel } from '#src/modules/agents/agent.model.js';

export function createAgentRepository({ data }) {
  return AgentModel.create(data);
}
