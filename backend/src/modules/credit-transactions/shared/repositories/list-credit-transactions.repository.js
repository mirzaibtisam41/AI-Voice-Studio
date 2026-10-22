import { CreditTransactionModel } from '#src/modules/credit-transactions/credit-transaction.model.js';
import { CREDIT_TRANSACTION_PUBLIC_FIELDS } from '#src/modules/credit-transactions/credit-transaction-fields.constants.js';

export function listCreditTransactionsRepository({ filter, skip = 0, limit }) {
  return CreditTransactionModel.find(filter)
    .select(CREDIT_TRANSACTION_PUBLIC_FIELDS)
    .sort({ createdAt: -1, _id: -1 })
    .skip(skip)
    .limit(limit);
}
