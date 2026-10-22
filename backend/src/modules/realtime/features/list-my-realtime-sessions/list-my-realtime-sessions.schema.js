import {
  OBJECT_ID_PATTERN,
  paginationQuerySchema,
} from '#src/shared/schemas/index.js';
import { REALTIME_SESSION_CAPABILITIES } from '#src/modules/realtime/realtime.constants.js';

export const listMyRealtimeSessionsSchema = {
  querystring: {
    type: 'object',
    properties: {
      ...paginationQuerySchema.properties,
      agentId: { type: 'string', pattern: OBJECT_ID_PATTERN },
      capability: { type: 'string', enum: REALTIME_SESSION_CAPABILITIES },
    },
    additionalProperties: false,
  },
};
