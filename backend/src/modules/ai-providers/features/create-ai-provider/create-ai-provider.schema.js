import {
  AI_PROVIDER_CODE_MAX_LENGTH,
  AI_PROVIDER_DESCRIPTION_MAX_LENGTH,
  AI_PROVIDER_NAME_MAX_LENGTH,
  AI_PROVIDER_STATUSES,
} from '#src/modules/ai-providers/ai-provider.constants.js';

export const createAiProviderSchema = {
  body: {
    type: 'object',
    required: ['code', 'name'],
    properties: {
      code: {
        type: 'string',
        minLength: 1,
        maxLength: AI_PROVIDER_CODE_MAX_LENGTH,
        pattern: '^[a-zA-Z0-9]+(-[a-zA-Z0-9]+)*$',
      },
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
      status: { type: 'string', enum: AI_PROVIDER_STATUSES },
    },
    additionalProperties: false,
  },
};
