import { AI_CAPABILITIES } from '#src/constants/index.js';
import { GENERATION_STATUSES } from '#src/modules/generations/generation.constants.js';
import { paginationQuerySchema } from '#src/shared/schemas/index.js';

export const listMyGenerationsSchema = {
  querystring: {
    type: 'object',
    properties: {
      ...paginationQuerySchema.properties,
      capability: { type: 'string', enum: AI_CAPABILITIES },
      status: { type: 'string', enum: GENERATION_STATUSES },
    },
    additionalProperties: false,
  },
};
