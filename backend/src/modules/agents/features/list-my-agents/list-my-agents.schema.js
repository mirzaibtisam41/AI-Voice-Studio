import { paginationQuerySchema } from '#src/shared/schemas/index.js';
import { AGENT_STATUSES } from '#src/modules/agents/agent.constants.js';

export const listMyAgentsSchema = {
  querystring: {
    type: 'object',
    properties: {
      ...paginationQuerySchema.properties,
      status: { type: 'string', enum: AGENT_STATUSES },
    },
    additionalProperties: false,
  },
};
