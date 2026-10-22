import { objectIdParamsSchema } from '#src/shared/schemas/index.js';
import { agentBodyProperties } from '#src/modules/agents/shared/schemas/index.js';

export const updateMyAgentSchema = {
  params: objectIdParamsSchema('id'),
  body: {
    type: 'object',
    minProperties: 1,
    properties: agentBodyProperties,
    additionalProperties: false,
  },
};
