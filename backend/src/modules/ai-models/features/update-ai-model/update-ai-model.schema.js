import {
  AI_MODEL_DESCRIPTION_MAX_LENGTH,
  AI_MODEL_NAME_MAX_LENGTH,
} from '#src/modules/ai-models/ai-model.constants.js';
import { objectIdParamsSchema } from '#src/shared/schemas/index.js';

export const updateAiModelSchema = {
  params: objectIdParamsSchema('id'),
  body: {
    type: 'object',
    minProperties: 1,
    properties: {
      name: {
        type: 'string',
        minLength: 1,
        maxLength: AI_MODEL_NAME_MAX_LENGTH,
        pattern: '\\S',
      },
      description: {
        type: ['string', 'null'],
        maxLength: AI_MODEL_DESCRIPTION_MAX_LENGTH,
      },
    },
    additionalProperties: false,
  },
};
