import { GenerationModel } from '#src/modules/generations/generation.model.js';

export function listUserTranscriptionsRepository({ filter, skip, limit }) {
  return GenerationModel.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
}
