import { agentBodyProperties } from '#src/modules/agents/shared/schemas/index.js';

export const createAgentSchema = {
  body: {
    type: 'object',
    required: ['name', 'voiceCode', 'instructions'],
    properties: agentBodyProperties,
    additionalProperties: false,
  },
};
