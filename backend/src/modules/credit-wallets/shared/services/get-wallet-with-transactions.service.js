import { NotFoundError } from '#src/utils/index.js';
import { findCreditWalletByUserIdRepository } from '#src/modules/credit-wallets/shared/repositories/index.js';
import { listCreditTransactionsRepository } from '#src/modules/credit-transactions/shared/repositories/index.js';

export async function getWalletWithTransactionsService({ userId, limit }) {
  const [wallet, transactions] = await Promise.all([
    findCreditWalletByUserIdRepository({ userId }),
    listCreditTransactionsRepository({ filter: { userId }, limit }),
  ]);

  if (!wallet) {
    throw new NotFoundError('Credit wallet not found');
  }

  return { balance: wallet.balance, transactions };
}
