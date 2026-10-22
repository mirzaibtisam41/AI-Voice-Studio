import { PROVIDER_ERROR_CATEGORY } from '#src/constants/index.js';
import { ProviderError } from '#src/utils/index.js';

export async function generateChatReplyIntegration() {
  throw new ProviderError({ category: PROVIDER_ERROR_CATEGORY.UNKNOWN });
}
