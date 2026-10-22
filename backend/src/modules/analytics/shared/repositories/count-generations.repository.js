import { GenerationModel } from '#src/modules/generations/generation.model.js';

export function countGenerationsRepository({ createdSince }) {
  return GenerationModel.countDocuments({ createdAt: { $gte: createdSince } });
}
