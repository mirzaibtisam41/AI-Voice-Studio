import { InsufficientCreditsError, NotFoundError } from '#src/utils/index.js';
import {
  findCreditWalletByUserIdRepository,
  incrementCreditWalletBalanceRepository,
} from '#src/modules/credit-wallets/shared/repositories/index.js';
import {
  createCreditTransactionRepository,
  findCreditTransactionByIdempotencyKeyRepository,
} from '#src/modules/credit-transactions/shared/repositories/index.js';

export async function applyCreditChangeService({
  session,
  userId,
  amount,
  type,
  capability = null,
  generationId = null,
  reason = null,
  createdBy = null,
  idempotencyKey,
}) {
  if (idempotencyKey) {
    const existing = await findCreditTransactionByIdempotencyKeyRepository({
      session,
      idempotencyKey,
    });

    if (existing) {
      return {
        transaction: existing,
        balance: existing.balanceAfter,
        isDuplicate: true,
      };
    }
  }

  const wallet = await incrementCreditWalletBalanceRepository({
    session,
    userId,
    amount,
  });

  if (!wallet) {
    const existingWallet = await findCreditWalletByUserIdRepository({
      session,
      userId,
    });

    if (!existingWallet) {
      throw new NotFoundError('Credit wallet not found');
    }

    throw new InsufficientCreditsError(
      `This needs ${-amount} credits but you have ${existingWallet.balance}`,
    );
  }

  const transaction = await createCreditTransactionRepository({
    session,
    data: {
      userId,
      walletId: wallet._id,
      amount,
      balanceAfter: wallet.balance,
      type,
      capability,
      generationId,
      reason,
      createdBy,
      idempotencyKey: idempotencyKey ?? undefined,
    },
  });

  return { transaction, balance: wallet.balance, isDuplicate: false };
}
