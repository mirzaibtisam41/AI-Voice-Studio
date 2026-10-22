import { AI_CAPABILITIES } from '#src/constants/index.js';
import { GENERATION_STATUSES } from '#src/modules/generations/generation.constants.js';
import { GENERATION_SEARCH_MAX_LENGTH } from '#src/modules/generations/generation-history.constants.js';
import {
  OBJECT_ID_PATTERN,
  paginationQuerySchema,
} from '#src/shared/schemas/index.js';

const dateQuerySchema = {
  type: 'string',
  anyOf: [{ format: 'date' }, { format: 'date-time' }],
};

export const listAdminGenerationsSchema = {
  querystring: {
    type: 'object',
    properties: {
      ...paginationQuerySchema.properties,
      status: { type: 'string', enum: GENERATION_STATUSES },
      capability: { type: 'string', enum: AI_CAPABILITIES },
      userId: { type: 'string', pattern: OBJECT_ID_PATTERN },
      search: { type: 'string', maxLength: GENERATION_SEARCH_MAX_LENGTH },
      from: dateQuerySchema,
      to: dateQuerySchema,
    },
    additionalProperties: false,
  },
};
