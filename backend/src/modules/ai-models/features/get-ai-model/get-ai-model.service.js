import { NotFoundError } from '#src/utils/index.js';
import { findAiModelByIdRepository } from '#src/modules/ai-models/shared/repositories/index.js';

export async function getAiModelService({ id }) {
  const model = await findAiModelByIdRepository({ id });

  if (!model) {
    throw new NotFoundError('Model not found');
  }

  return model;
}
