import { CreditTransactionModel } from '#src/modules/credit-transactions/credit-transaction.model.js';

export function countCreditTransactionsRepository({ filter }) {
  return CreditTransactionModel.countDocuments(filter);
}
