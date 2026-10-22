import {
  AI_MODEL_DESCRIPTION_MAX_LENGTH,
  AI_MODEL_NAME_MAX_LENGTH,
  AI_MODEL_PROVIDER_MODEL_ID_MAX_LENGTH,
  AI_MODEL_SLUG_MAX_LENGTH,
} from '#src/modules/ai-models/ai-model.constants.js';
import { OBJECT_ID_PATTERN } from '#src/shared/schemas/index.js';

export const createAiModelSchema = {
  body: {
    type: 'object',
    required: ['providerId', 'name', 'slug', 'providerModelId'],
    properties: {
      providerId: { type: 'string', pattern: OBJECT_ID_PATTERN },
      name: {
        type: 'string',
        minLength: 1,
        maxLength: AI_MODEL_NAME_MAX_LENGTH,
        pattern: '\\S',
      },
      slug: {
        type: 'string',
        minLength: 1,
        maxLength: AI_MODEL_SLUG_MAX_LENGTH,
        pattern: '^[a-zA-Z0-9]+(-[a-zA-Z0-9]+)*$',
      },
      providerModelId: {
        type: 'string',
        minLength: 1,
        maxLength: AI_MODEL_PROVIDER_MODEL_ID_MAX_LENGTH,
        pattern: '^[A-Za-z0-9._:/-]+$',
      },
      description: {
        type: ['string', 'null'],
        maxLength: AI_MODEL_DESCRIPTION_MAX_LENGTH,
      },
    },
    additionalProperties: false,
  },
};
