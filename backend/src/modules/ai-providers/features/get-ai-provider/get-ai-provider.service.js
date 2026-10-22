import { NotFoundError } from '#src/utils/index.js';
import { findAiProviderByIdRepository } from '#src/modules/ai-providers/shared/repositories/index.js';
import { countProviderAiModelsRepository } from '#src/modules/ai-models/shared/repositories/index.js';

export async function getAiProviderService({ id }) {
  const provider = await findAiProviderByIdRepository({ id });

  if (!provider) {
    throw new NotFoundError('Provider not found');
  }

  const modelsCount = await countProviderAiModelsRepository({
    providerId: provider._id,
  });

  return { ...provider.toJSON(), modelsCount };
}
