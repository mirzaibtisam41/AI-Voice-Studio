import { GenerationModel } from '#src/modules/generations/generation.model.js';

export function findUserGenerationByIdRepository({ userId, generationId }) {
  return GenerationModel.findOne({ _id: generationId, userId });
}
