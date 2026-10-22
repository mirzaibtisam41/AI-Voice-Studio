import { GenerationModel } from '#src/modules/generations/generation.model.js';

export function findGenerationByIdRepository({ session, generationId }) {
  return GenerationModel.findById(generationId).session(session ?? null);
}
