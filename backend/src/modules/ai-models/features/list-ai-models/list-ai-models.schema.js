import { AI_CAPABILITIES } from '#src/constants/index.js';
import {
  AI_MODEL_NAME_MAX_LENGTH,
  AI_MODEL_STATUSES,
} from '#src/modules/ai-models/ai-model.constants.js';
import {
  OBJECT_ID_PATTERN,
  paginationQuerySchema,
} from '#src/shared/schemas/index.js';

export const listAiModelsSchema = {
  querystring: {
    type: 'object',
    properties: {
      ...paginationQuerySchema.properties,
      search: { type: 'string', maxLength: AI_MODEL_NAME_MAX_LENGTH },
      providerId: { type: 'string', pattern: OBJECT_ID_PATTERN },
      status: { type: 'string', enum: AI_MODEL_STATUSES },
      capability: { type: 'string', enum: AI_CAPABILITIES },
    },
    additionalProperties: false,
  },
};
