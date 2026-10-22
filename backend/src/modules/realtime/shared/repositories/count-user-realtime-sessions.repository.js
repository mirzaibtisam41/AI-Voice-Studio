import { GenerationModel } from '#src/modules/generations/generation.model.js';

export function countUserRealtimeSessionsRepository({ filter }) {
  return GenerationModel.countDocuments(filter);
}
