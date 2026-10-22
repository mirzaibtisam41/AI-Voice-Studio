import { OBJECT_ID_PATTERN } from '#src/shared/schemas/index.js';
import { AGENT_RESPONSE_STYLES } from '#src/modules/agents/agent.constants.js';
import { REALTIME_INSTRUCTIONS_MAX_LENGTH } from '#src/modules/realtime/realtime.constants.js';

export const createRealtimeSessionSchema = {
  body: {
    type: 'object',
    properties: {
      voiceCode: {
        type: 'string',
        minLength: 1,
        maxLength: 60,
        pattern: '^[A-Za-z0-9_-]+$',
      },
      instructions: {
        type: 'string',
        maxLength: REALTIME_INSTRUCTIONS_MAX_LENGTH,
      },
      responseStyle: { type: 'string', enum: AGENT_RESPONSE_STYLES },
      modelId: { type: 'string', pattern: OBJECT_ID_PATTERN },
      agentId: { type: 'string', pattern: OBJECT_ID_PATTERN },
    },
    additionalProperties: false,
  },
};
