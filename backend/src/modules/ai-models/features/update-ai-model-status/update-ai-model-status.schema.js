import { AI_MODEL_STATUSES } from '#src/modules/ai-models/ai-model.constants.js';
import { objectIdParamsSchema } from '#src/shared/schemas/index.js';

export const updateAiModelStatusSchema = {
  params: objectIdParamsSchema('id'),
  body: {
    type: 'object',
    required: ['status'],
    properties: {
      status: { type: 'string', enum: AI_MODEL_STATUSES },
    },
    additionalProperties: false,
  },
};
