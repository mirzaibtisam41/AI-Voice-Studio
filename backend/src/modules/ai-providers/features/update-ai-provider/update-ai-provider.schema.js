import {
  AI_PROVIDER_DESCRIPTION_MAX_LENGTH,
  AI_PROVIDER_NAME_MAX_LENGTH,
} from '#src/modules/ai-providers/ai-provider.constants.js';
import { objectIdParamsSchema } from '#src/shared/schemas/index.js';

export const updateAiProviderSchema = {
  params: objectIdParamsSchema('id'),
  body: {
    type: 'object',
    minProperties: 1,
    properties: {
      name: {
        type: 'string',
        minLength: 1,
        maxLength: AI_PROVIDER_NAME_MAX_LENGTH,
        pattern: '\\S',
      },
      description: {
        type: ['string', 'null'],
        maxLength: AI_PROVIDER_DESCRIPTION_MAX_LENGTH,
      },
    },
    additionalProperties: false,
  },
};
