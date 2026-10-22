import { objectIdParamsSchema } from '#src/shared/schemas/index.js';
import { AGENT_ANALYTICS_DAYS } from '#src/modules/agents/agent.constants.js';

export const getMyAgentAnalyticsSchema = {
  params: objectIdParamsSchema('id'),
  querystring: {
    type: 'object',
    properties: {
      days: {
        type: 'integer',
        enum: AGENT_ANALYTICS_DAYS,
        default: AGENT_ANALYTICS_DAYS[0],
      },
    },
    additionalProperties: false,
  },
};
