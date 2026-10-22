import { USER_WALLET_RECENT_TRANSACTIONS } from '#src/modules/credit-wallets/credit-wallet.constants.js';
import { getWalletWithTransactionsService } from '#src/modules/credit-wallets/shared/services/index.js';

export async function getUserWalletController(request, reply) {
  const { balance, transactions } = await getWalletWithTransactionsService({
    userId: request.params.userId,
    limit: USER_WALLET_RECENT_TRANSACTIONS,
  });

  return reply.success({ data: { balance, transactions } });
}
