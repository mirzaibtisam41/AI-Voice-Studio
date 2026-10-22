import {
  buildPaginationMetaUtil,
  buildPaginationUtil,
} from '#src/utils/index.js';
import {
  countCreditTransactionsRepository,
  listCreditTransactionsRepository,
} from '#src/modules/credit-transactions/shared/repositories/index.js';
import { buildCreditTransactionFilterUtil } from '#src/modules/credit-transactions/shared/utils/index.js';

export async function listMyTransactionsService({ userId, query }) {
  const { page, limit } = query;
  const filter = buildCreditTransactionFilterUtil({
    userId,
    type: query.type,
    capability: query.capability,
  });
  const { skip } = buildPaginationUtil({ page, limit });

  const [transactions, total] = await Promise.all([
    listCreditTransactionsRepository({ filter, skip, limit }),
    countCreditTransactionsRepository({ filter }),
  ]);

  return {
    transactions,
    meta: buildPaginationMetaUtil({ page, limit, total }),
  };
}
