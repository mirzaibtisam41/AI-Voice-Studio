import { CreditTransactionModel } from '#src/modules/credit-transactions/credit-transaction.model.js';

export function findCreditTransactionByIdempotencyKeyRepository({
  session,
  idempotencyKey,
}) {
  return CreditTransactionModel.findOne({ idempotencyKey }).session(
    session ?? null,
  );
}
