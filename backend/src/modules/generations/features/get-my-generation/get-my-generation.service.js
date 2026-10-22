import { NotFoundError } from '#src/utils/index.js';
import { findUserGenerationByIdRepository } from '#src/modules/generations/shared/repositories/index.js';

export async function getMyGenerationService({ userId, generationId }) {
  const generation = await findUserGenerationByIdRepository({
    userId,
    generationId,
  });

  if (!generation) {
    throw new NotFoundError('Generation not found');
  }

  return generation;
}
