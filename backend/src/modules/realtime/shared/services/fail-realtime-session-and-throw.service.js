import { PROVIDER_ERROR_CATEGORY } from '#src/constants/index.js';
import {
  PROVIDER_CATEGORIES_THAT_NEED_AN_ADMIN,
  ProviderError,
  buildProviderFailureErrorUtil,
} from '#src/utils/index.js';
import { failGenerationService } from '#src/modules/generations/shared/services/index.js';

export async function failRealtimeSessionAndThrowService({
  log,
  generation,
  error,
}) {
  const category =
    error instanceof ProviderError
      ? error.category
      : PROVIDER_ERROR_CATEGORY.UNKNOWN;

  const { refundedCredits } = await failGenerationService({
    generationId: generation._id,
    errorCategory: category,
    reason: 'Refund for a conversation that could not start',
  });

  const logDetails = { err: error, generationId: generation.id, category };

  if (PROVIDER_CATEGORIES_THAT_NEED_AN_ADMIN.includes(category)) {
    log.error(logDetails, 'Real-time session failed to start');
  } else {
    log.warn(logDetails, 'Real-time session failed to start');
  }

  throw buildProviderFailureErrorUtil({ category, refundedCredits });
}
