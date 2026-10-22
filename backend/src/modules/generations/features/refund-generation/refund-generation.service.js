import {
  BadRequestError,
  ConflictError,
  NotFoundError,
  runInTransactionUtil,
} from '#src/utils/index.js';
import { CAPABILITY_DETAILS } from '#src/constants/index.js';
import { CREDIT_TRANSACTION_TYPE } from '#src/modules/credit-transactions/credit-transaction.constants.js';
import { findCreditTransactionByIdempotencyKeyRepository } from '#src/modules/credit-transactions/shared/repositories/index.js';
import { applyCreditChangeService } from '#src/modules/credit-wallets/shared/services/index.js';
import { GENERATION_STATUS } from '#src/modules/generations/generation.constants.js';
import { GENERATION_REFUND_REASON_MIN_LENGTH } from '#src/modules/generations/generation-history.constants.js';
import { findGenerationByIdRepository } from '#src/modules/generations/shared/repositories/index.js';
import { presentGenerationSummaryUtil } from '#src/modules/generations/shared/utils/index.js';
import {
  AUDIT_ACTION,
  AUDIT_TARGET_TYPE,
} from '#src/modules/audit-logs/audit-log.constants.js';
import { recordAuditLogService } from '#src/modules/audit-logs/shared/services/index.js';

const REFUNDABLE_STATUSES = [
  GENERATION_STATUS.COMPLETED,
  GENERATION_STATUS.FAILED,
];

export function refundGenerationService({ actor, generationId, reason }) {
  const trimmedReason = reason.trim();

  if (trimmedReason.length < GENERATION_REFUND_REASON_MIN_LENGTH) {
    throw new BadRequestError(
      `Reason must be at least ${GENERATION_REFUND_REASON_MIN_LENGTH} characters`,
    );
  }

  const idempotencyKey = `generation:${generationId}:admin-refund`;

  return runInTransactionUtil({
    work: async ({ session }) => {
      const generation = await findGenerationByIdRepository({
        session,
        generationId,
      });

      if (!generation) {
        throw new NotFoundError('Generation not found');
      }

      const previousRefund =
        await findCreditTransactionByIdempotencyKeyRepository({
          session,
          idempotencyKey,
        });

      if (previousRefund) {
        throw new ConflictError('Already refunded');
      }

      if (!REFUNDABLE_STATUSES.includes(generation.status)) {
        throw new BadRequestError(
          'Only completed or failed generations can be refunded',
        );
      }

      const charged = generation.creditsCharged;

      if (charged <= 0) {
        throw new BadRequestError(
          'This generation has no charged credits to refund',
        );
      }

      const before = {
        creditsCharged: generation.creditsCharged,
        creditsRefunded: generation.creditsRefunded,
      };

      const { balance } = await applyCreditChangeService({
        session,
        userId: generation.userId,
        amount: charged,
        type: CREDIT_TRANSACTION_TYPE.USAGE_REFUND,
        capability: generation.capability,
        generationId: generation._id,
        reason: trimmedReason,
        createdBy: actor._id,
        idempotencyKey,
      });

      generation.creditsRefunded += charged;
      generation.creditsCharged = 0;
      await generation.save({ session });

      await recordAuditLogService({
        session,
        actor,
        action: AUDIT_ACTION.GENERATION_REFUNDED,
        targetType: AUDIT_TARGET_TYPE.GENERATION,
        targetId: generation._id,
        targetLabel: CAPABILITY_DETAILS[generation.capability].label,
        details: {
          before,
          after: {
            creditsCharged: generation.creditsCharged,
            creditsRefunded: generation.creditsRefunded,
          },
          amount: charged,
          reason: trimmedReason,
          userId: String(generation.userId),
        },
      });

      return {
        generation: presentGenerationSummaryUtil({ generation }),
        refundedCredits: charged,
        balance,
      };
    },
  });
}
