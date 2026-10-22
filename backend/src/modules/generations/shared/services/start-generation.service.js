import mongoose from 'mongoose';
import { runInTransactionUtil } from '#src/utils/index.js';
import { CREDIT_TRANSACTION_TYPE } from '#src/modules/credit-transactions/credit-transaction.constants.js';
import { applyCreditChangeService } from '#src/modules/credit-wallets/shared/services/index.js';
import { createGenerationRepository } from '#src/modules/generations/shared/repositories/index.js';

export function startGenerationService({
  userId,
  pricedModel,
  units,
  creditsHeld,
  input,
  realtime,
  reason,
}) {
  return runInTransactionUtil({
    work: async ({ session }) => {
      const generationId = new mongoose.Types.ObjectId();

      const generation = await createGenerationRepository({
        session,
        data: {
          _id: generationId,
          userId,
          capability: pricedModel.capability,
          modelId: pricedModel.model._id,
          providerModelId: pricedModel.model.providerModelId,
          creditsPerUnit: pricedModel.creditsPerUnit,
          units,
          creditsHeld,
          input,
          realtime,
        },
      });

      if (creditsHeld > 0) {
        await applyCreditChangeService({
          session,
          userId,
          amount: -creditsHeld,
          type: CREDIT_TRANSACTION_TYPE.USAGE_HOLD,
          capability: pricedModel.capability,
          generationId,
          reason,
          idempotencyKey: `generation:${generationId}:hold`,
        });
      }

      return generation;
    },
  });
}
