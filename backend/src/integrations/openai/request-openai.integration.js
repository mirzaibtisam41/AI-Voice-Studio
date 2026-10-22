import { ProviderError } from '#src/utils/index.js';
import { mapOpenAiErrorIntegration } from '#src/integrations/openai/map-openai-error.integration.js';

export async function requestOpenAiIntegration({ send }) {
  try {
    return await send();
  } catch (error) {
    throw new ProviderError({
      category: mapOpenAiErrorIntegration({ error }),
      cause: error,
    });
  }
}
