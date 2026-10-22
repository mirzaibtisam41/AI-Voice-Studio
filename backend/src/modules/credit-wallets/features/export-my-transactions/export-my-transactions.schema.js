import { transactionFilterProperties } from '#src/modules/credit-wallets/features/list-my-transactions/list-my-transactions.schema.js';

export const exportMyTransactionsSchema = {
  querystring: {
    type: 'object',
    properties: { ...transactionFilterProperties },
    additionalProperties: false,
  },
};
