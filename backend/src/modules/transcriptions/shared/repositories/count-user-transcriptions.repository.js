import { GenerationModel } from '#src/modules/generations/generation.model.js';

export function countUserTranscriptionsRepository({ filter }) {
  return GenerationModel.countDocuments(filter);
}
