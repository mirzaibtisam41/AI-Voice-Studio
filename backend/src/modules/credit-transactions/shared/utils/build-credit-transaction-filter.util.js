import { CREDIT_TRANSACTION_FILTER_TYPES } from '#src/modules/credit-transactions/credit-transaction.constants.js';

export function buildCreditTransactionFilterUtil({ userId, type, capability }) {
  const filter = { userId };

  if (type) filter.type = { $in: CREDIT_TRANSACTION_FILTER_TYPES[type] };
  if (capability) filter.capability = capability;

  return filter;
}
