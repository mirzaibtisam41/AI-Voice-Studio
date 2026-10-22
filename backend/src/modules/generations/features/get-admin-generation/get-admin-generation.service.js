import { NotFoundError } from '#src/utils/index.js';
import { findAdminGenerationByIdRepository } from '#src/modules/generations/shared/repositories/index.js';

export async function getAdminGenerationService({ generationId }) {
  const generation = await findAdminGenerationByIdRepository({ generationId });

  if (!generation) {
    throw new NotFoundError('Generation not found');
  }

  const user = generation.userId;
  const model = generation.modelId;

  return {
    ...generation.toJSON({ depopulate: true }),
    user: user?.toJSON?.() ?? null,
    model: model?.toJSON?.() ?? null,
  };
}
