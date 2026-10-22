import { objectIdParamsSchema } from '#src/shared/schemas/index.js';
import {
  GENERATION_REFUND_REASON_MAX_LENGTH,
  GENERATION_REFUND_REASON_MIN_LENGTH,
} from '#src/modules/generations/generation-history.constants.js';

export const refundGenerationSchema = {
  params: objectIdParamsSchema('id'),
  body: {
    type: 'object',
    required: ['reason'],
    properties: {
      reason: {
        type: 'string',
        minLength: GENERATION_REFUND_REASON_MIN_LENGTH,
        maxLength: GENERATION_REFUND_REASON_MAX_LENGTH,
        pattern: '\\S',
      },
    },
    additionalProperties: false,
  },
};
