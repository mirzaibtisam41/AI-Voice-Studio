import {
  AI_CAPABILITY,
  PROVIDER_ERROR_CATEGORY,
} from '#src/constants/index.js';
import { findStuckGenerationsRepository } from '#src/modules/generations/shared/repositories/index.js';
import { completeGenerationService } from '#src/modules/generations/shared/services/complete-generation.service.js';
import { failGenerationService } from '#src/modules/generations/shared/services/fail-generation.service.js';

const SESSION_CAPABILITIES = [
  AI_CAPABILITY.REALTIME,
  AI_CAPABILITY.VOICE_AGENT,
];

export async function settleStuckGenerationsService({ now = new Date() } = {}) {
  const stuck = await findStuckGenerationsRepository({ now });
  let settledCount = 0;

  for (const generation of stuck) {
    if (SESSION_CAPABILITIES.includes(generation.capability)) {
      await completeGenerationService({
        generationId: generation._id,
        creditsCharged: generation.creditsHeld,
        realtime: { endedAt: generation.realtime?.expiresAt ?? now },
      });
    } else {
      await failGenerationService({
        generationId: generation._id,
        errorCategory: PROVIDER_ERROR_CATEGORY.TIMEOUT,
        reason: 'Refund for a run that never finished',
      });
    }

    settledCount += 1;
  }

  return settledCount;
}
