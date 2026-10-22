import { AI_CAPABILITIES } from '#src/constants/index.js';
import { AI_MODEL_CREDITS_PER_UNIT_MAX } from '#src/modules/ai-models/ai-model.constants.js';
import { OBJECT_ID_PATTERN } from '#src/shared/schemas/index.js';

export const aiModelCapabilityParamsSchema = {
  type: 'object',
  required: ['id', 'code'],
  properties: {
    id: { type: 'string', pattern: OBJECT_ID_PATTERN },
    code: { type: 'string', enum: AI_CAPABILITIES },
  },
  additionalProperties: false,
};

export const saveAiModelCapabilitySchema = {
  params: aiModelCapabilityParamsSchema,
  body: {
    type: 'object',
    required: ['enabled'],
    properties: {
      enabled: { type: 'boolean' },
      creditsPerUnit: {
        type: ['integer', 'null'],
        minimum: 1,
        maximum: AI_MODEL_CREDITS_PER_UNIT_MAX,
      },
    },
    additionalProperties: false,
  },
};
