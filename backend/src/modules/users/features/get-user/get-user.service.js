import { NotFoundError } from '#src/utils/index.js';
import { countActiveUserAuthSessionsRepository } from '#src/modules/auth-sessions/shared/repositories/index.js';
import { findCreditWalletByUserIdRepository } from '#src/modules/credit-wallets/shared/repositories/index.js';
import {
  findUserByIdRepository,
  listRecentUserCreditTransactionsRepository,
  summarizeUserGenerationsRepository,
} from '#src/modules/users/shared/repositories/index.js';

const RECENT_TRANSACTIONS_LIMIT = 10;

export async function getUserService({ userId }) {
  const user = await findUserByIdRepository({ id: userId });

  if (!user) {
    throw new NotFoundError('User not found');
  }

  const [wallet, activeSessions, usage, recentTransactions] = await Promise.all(
    [
      findCreditWalletByUserIdRepository({ userId: user._id }),
      countActiveUserAuthSessionsRepository({ userId: user._id }),
      summarizeUserGenerationsRepository({ userId: user._id }),
      listRecentUserCreditTransactionsRepository({
        userId: user._id,
        limit: RECENT_TRANSACTIONS_LIMIT,
      }),
    ],
  );

  return {
    user,
    balance: wallet?.balance ?? 0,
    activeSessions,
    usage,
    recentTransactions,
  };
}
