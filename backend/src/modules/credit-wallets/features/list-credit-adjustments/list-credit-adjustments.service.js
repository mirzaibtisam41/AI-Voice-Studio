import {
  buildPaginationMetaUtil,
  buildPaginationUtil,
} from '#src/utils/index.js';
import { ADMIN_ADJUSTMENT_TYPES } from '#src/modules/credit-transactions/credit-transaction.constants.js';
import {
  countCreditTransactionsRepository,
  listCreditAdjustmentsRepository,
} from '#src/modules/credit-transactions/shared/repositories/index.js';

function presentPerson(person) {
  if (!person) return null;

  return { id: person.id, name: person.name, email: person.email };
}

function presentAdjustment(transaction) {
  return {
    id: transaction.id,
    amount: transaction.amount,
    balanceAfter: transaction.balanceAfter,
    type: transaction.type,
    reason: transaction.reason,
    createdAt: transaction.createdAt,
    user: presentPerson(transaction.userId),
    admin: presentPerson(transaction.createdBy),
  };
}

export async function listCreditAdjustmentsService({ query }) {
  const { page, limit } = query;
  const { skip } = buildPaginationUtil({ page, limit });

  const [transactions, total] = await Promise.all([
    listCreditAdjustmentsRepository({ skip, limit }),
    countCreditTransactionsRepository({
      filter: { type: { $in: ADMIN_ADJUSTMENT_TYPES } },
    }),
  ]);

  return {
    adjustments: transactions.map(presentAdjustment),
    meta: buildPaginationMetaUtil({ page, limit, total }),
  };
}
