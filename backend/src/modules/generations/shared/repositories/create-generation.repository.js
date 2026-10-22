import { GenerationModel } from '#src/modules/generations/generation.model.js';

export async function createGenerationRepository({ session, data }) {
  const [generation] = await GenerationModel.create([data], { session });

  return generation;
}
