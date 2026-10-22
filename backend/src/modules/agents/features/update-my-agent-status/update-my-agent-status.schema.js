import { objectIdParamsSchema } from '#src/shared/schemas/index.js';
import { AGENT_STATUSES } from '#src/modules/agents/agent.constants.js';

export const updateMyAgentStatusSchema = {
  params: objectIdParamsSchema('id'),
  body: {
    type: 'object',
    required: ['status'],
    properties: { status: { type: 'string', enum: AGENT_STATUSES } },
    additionalProperties: false,
  },
};
