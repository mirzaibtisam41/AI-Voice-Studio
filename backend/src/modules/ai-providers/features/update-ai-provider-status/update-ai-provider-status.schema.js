import { AI_PROVIDER_STATUSES } from '#src/modules/ai-providers/ai-provider.constants.js';
import { objectIdParamsSchema } from '#src/shared/schemas/index.js';

export const updateAiProviderStatusSchema = {
  params: objectIdParamsSchema('id'),
  body: {
    type: 'object',
    required: ['status'],
    properties: {
      status: { type: 'string', enum: AI_PROVIDER_STATUSES },
    },
    additionalProperties: false,
  },
};
