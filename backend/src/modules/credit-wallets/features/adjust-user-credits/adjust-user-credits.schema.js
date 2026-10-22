import { objectIdParamsSchema } from '#src/shared/schemas/index.js';
import {
  CREDIT_ADJUSTMENT_MAX_AMOUNT,
  CREDIT_ADJUSTMENT_REASON_MAX_LENGTH,
  CREDIT_ADJUSTMENT_REASON_MIN_LENGTH,
  IDEMPOTENCY_KEY_HEADER_MAX_LENGTH,
} from '#src/modules/credit-wallets/credit-wallet.constants.js';

export const adjustUserCreditsSchema = {
  params: objectIdParamsSchema('userId'),
  headers: {
    type: 'object',
    properties: {
      'idempotency-key': {
        type: 'string',
        minLength: 1,
        maxLength: IDEMPOTENCY_KEY_HEADER_MAX_LENGTH,
        pattern: '^[A-Za-z0-9._:-]+$',
      },
    },
  },
  body: {
    type: 'object',
    required: ['amount', 'reason'],
    properties: {
      amount: {
        type: 'integer',
        minimum: -CREDIT_ADJUSTMENT_MAX_AMOUNT,
        maximum: CREDIT_ADJUSTMENT_MAX_AMOUNT,
        not: { const: 0 },
      },
      reason: {
        type: 'string',
        minLength: CREDIT_ADJUSTMENT_REASON_MIN_LENGTH,
        maxLength: CREDIT_ADJUSTMENT_REASON_MAX_LENGTH,
        pattern: '\\S',
      },
    },
    additionalProperties: false,
  },
};
