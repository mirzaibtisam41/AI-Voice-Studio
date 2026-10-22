import { CreditTransactionModel } from '#src/modules/credit-transactions/credit-transaction.model.js';

export function listRecentUserCreditTransactionsRepository({ userId, limit }) {
  return CreditTransactionModel.find({ userId })
    .sort({ createdAt: -1, _id: -1 })
    .limit(limit);
}
