import {
  BadRequestError,
  ConflictError,
  NotFoundError,
  runInTransactionUtil,
} from '#src/utils/index.js';
import { CREDIT_TRANSACTION_TYPE } from '#src/modules/credit-transactions/credit-transaction.constants.js';
import { findCreditTransactionByIdempotencyKeyRepository } from '#src/modules/credit-transactions/shared/repositories/index.js';
import {
  findCreditWalletByUserIdRepository,
  findWalletUserRepository,
} from '#src/modules/credit-wallets/shared/repositories/index.js';
import { applyCreditChangeService } from '#src/modules/credit-wallets/shared/services/index.js';
import { CREDIT_ADJUSTMENT_REASON_MIN_LENGTH } from '#src/modules/credit-wallets/credit-wallet.constants.js';
import {
  AUDIT_ACTION,
  AUDIT_TARGET_TYPE,
} from '#src/modules/audit-logs/audit-log.constants.js';
import { recordAuditLogService } from '#src/modules/audit-logs/shared/services/index.js';

async function findDuplicate({ session, userId, idempotencyKey }) {
  if (!idempotencyKey) return null;

  const existing = await findCreditTransactionByIdempotencyKeyRepository({
    session,
    idempotencyKey,
  });

  if (existing && String(existing.userId) !== String(userId)) {
    throw new ConflictError(
      'This idempotency key was already used for another adjustment',
    );
  }

  return existing;
}

export function adjustUserCreditsService({
  actor,
  userId,
  amount,
  reason,
  idempotencyHeader,
}) {
  const trimmedReason = reason.trim();

  if (trimmedReason.length < CREDIT_ADJUSTMENT_REASON_MIN_LENGTH) {
    throw new BadRequestError(
      `Reason must be at least ${CREDIT_ADJUSTMENT_REASON_MIN_LENGTH} characters`,
    );
  }

  const idempotencyKey = idempotencyHeader
    ? `admin-adjust:${idempotencyHeader}`
    : undefined;

  return runInTransactionUtil({
    work: async ({ session }) => {
      const user = await findWalletUserRepository({ session, userId });
      const wallet = await findCreditWalletByUserIdRepository({
        session,
        userId,
      });

      if (!user || !wallet) {
        throw new NotFoundError('User not found');
      }

      const duplicate = await findDuplicate({
        session,
        userId,
        idempotencyKey,
      });

      if (duplicate) {
        return {
          transaction: duplicate,
          balance: wallet.balance,
          isDuplicate: true,
        };
      }

      const before = wallet.balance;

      if (before + amount < 0) {
        throw new BadRequestError('This would make the balance negative');
      }

      const { transaction, balance } = await applyCreditChangeService({
        session,
        userId,
        amount,
        type:
          amount > 0
            ? CREDIT_TRANSACTION_TYPE.ADMIN_CREDIT
            : CREDIT_TRANSACTION_TYPE.ADMIN_DEBIT,
        reason: trimmedReason,
        createdBy: actor._id,
        idempotencyKey,
      });

      await recordAuditLogService({
        session,
        actor,
        action: AUDIT_ACTION.WALLET_ADJUSTED,
        targetType: AUDIT_TARGET_TYPE.USER,
        targetId: user._id,
        targetLabel: user.email,
        details: { before, after: balance, amount, reason: trimmedReason },
      });

      return { transaction, balance, isDuplicate: false };
    },
  });
}
