import { CreditTransactionModel } from '#src/modules/credit-transactions/credit-transaction.model.js';

export async function createCreditTransactionRepository({ session, data }) {
  const [transaction] = await CreditTransactionModel.create([data], {
    session,
  });

  return transaction;
}
