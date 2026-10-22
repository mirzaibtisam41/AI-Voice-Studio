import { AI_CAPABILITIES } from '#src/constants/index.js';
import { CREDIT_TRANSACTION_FILTERS } from '#src/modules/credit-transactions/credit-transaction.constants.js';
import { paginationQuerySchema } from '#src/shared/schemas/index.js';

export const transactionFilterProperties = {
  type: { type: 'string', enum: CREDIT_TRANSACTION_FILTERS },
  capability: { type: 'string', enum: AI_CAPABILITIES },
};

export const listMyTransactionsSchema = {
  querystring: {
    type: 'object',
    properties: {
      ...paginationQuerySchema.properties,
      ...transactionFilterProperties,
    },
    additionalProperties: false,
  },
};
