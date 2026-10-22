import { GenerationModel } from '#src/modules/generations/generation.model.js';

export function countGenerationsRepository({ filter }) {
  return GenerationModel.countDocuments(filter);
}
