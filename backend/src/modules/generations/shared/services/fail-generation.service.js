import { NotFoundError, runInTransactionUtil } from '#src/utils/index.js';
import { CREDIT_TRANSACTION_TYPE } from '#src/modules/credit-transactions/credit-transaction.constants.js';
import { applyCreditChangeService } from '#src/modules/credit-wallets/shared/services/index.js';
import { GENERATION_STATUS } from '#src/modules/generations/generation.constants.js';
import { findGenerationByIdRepository } from '#src/modules/generations/shared/repositories/index.js';

export function failGenerationService({
  generationId,
  errorCategory,
  reason = 'Refund for a failed run',
}) {
  return runInTransactionUtil({
    work: async ({ session }) => {
      const generation = await findGenerationByIdRepository({
        session,
        generationId,
      });

      if (!generation) {
        throw new NotFoundError('Generation not found');
      }

      if (generation.status !== GENERATION_STATUS.PROCESSING) {
        return { generation, refundedCredits: 0 };
      }

      const refund = generation.creditsHeld;

      if (refund > 0) {
        await applyCreditChangeService({
          session,
          userId: generation.userId,
          amount: refund,
          type: CREDIT_TRANSACTION_TYPE.USAGE_REFUND,
          capability: generation.capability,
          generationId: generation._id,
          reason,
          idempotencyKey: `generation:${generation._id}:refund`,
        });
      }

      generation.status = GENERATION_STATUS.FAILED;
      generation.errorCategory = errorCategory;
      generation.creditsCharged = 0;
      generation.creditsRefunded = refund;
      generation.failedAt = new Date();

      await generation.save({ session });

      return { generation, refundedCredits: refund };
    },
  });
}
