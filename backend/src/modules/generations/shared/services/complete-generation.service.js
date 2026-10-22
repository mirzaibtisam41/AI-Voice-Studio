import { NotFoundError, runInTransactionUtil } from '#src/utils/index.js';
import { CREDIT_TRANSACTION_TYPE } from '#src/modules/credit-transactions/credit-transaction.constants.js';
import { applyCreditChangeService } from '#src/modules/credit-wallets/shared/services/index.js';
import { GENERATION_STATUS } from '#src/modules/generations/generation.constants.js';
import { findGenerationByIdRepository } from '#src/modules/generations/shared/repositories/index.js';

export function completeGenerationService({
  generationId,
  creditsCharged,
  units,
  output = {},
  realtime,
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
        return generation;
      }

      const charged = Math.min(
        generation.creditsHeld,
        Math.max(0, creditsCharged ?? generation.creditsHeld),
      );
      const refund = generation.creditsHeld - charged;

      if (refund > 0) {
        await applyCreditChangeService({
          session,
          userId: generation.userId,
          amount: refund,
          type: CREDIT_TRANSACTION_TYPE.USAGE_REFUND,
          capability: generation.capability,
          generationId: generation._id,
          reason: 'Unused credits returned',
          idempotencyKey: `generation:${generation._id}:settle`,
        });
      }

      generation.status = GENERATION_STATUS.COMPLETED;
      generation.creditsCharged = charged;
      generation.creditsRefunded = refund;
      generation.completedAt = new Date();

      if (units !== undefined) generation.units = units;

      for (const [key, value] of Object.entries(output)) {
        generation.output[key] = value;
      }

      if (realtime) {
        for (const [key, value] of Object.entries(realtime)) {
          generation.realtime[key] = value;
        }
      }

      await generation.save({ session });

      return generation;
    },
  });
}
