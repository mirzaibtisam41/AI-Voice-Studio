import { GenerationModel } from '#src/modules/generations/generation.model.js';

export function listGenerationsRepository({ filter, skip, limit }) {
  return GenerationModel.find(filter)
    .sort({ createdAt: -1, _id: -1 })
    .skip(skip)
    .limit(limit)
    .lean();
}
