import { PROVIDER_ERROR_CATEGORY } from '#src/constants/index.js';
import {
  PROVIDER_CATEGORIES_THAT_NEED_AN_ADMIN,
  ProviderError,
  buildProviderFailureErrorUtil,
} from '#src/utils/index.js';
import { failGenerationService } from '#src/modules/generations/shared/services/index.js';

export async function failAgentChatAndThrowService({ log, generation, error }) {
  const category =
    error instanceof ProviderError
      ? error.category
      : PROVIDER_ERROR_CATEGORY.UNKNOWN;

  const { refundedCredits } = await failGenerationService({
    generationId: generation._id,
    errorCategory: category,
  });

  const logDetails = { err: error, generationId: generation.id, category };

  if (PROVIDER_CATEGORIES_THAT_NEED_AN_ADMIN.includes(category)) {
    log.error(logDetails, 'Agent test chat failed');
  } else {
    log.warn(logDetails, 'Agent test chat failed');
  }

  throw buildProviderFailureErrorUtil({ category, refundedCredits });
}
