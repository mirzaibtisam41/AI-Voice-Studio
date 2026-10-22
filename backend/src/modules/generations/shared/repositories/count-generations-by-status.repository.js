import { GenerationModel } from '#src/modules/generations/generation.model.js';

export function countGenerationsByStatusRepository({ filter }) {
  return GenerationModel.aggregate([
    { $match: filter },
    { $group: { _id: '$status', total: { $sum: 1 } } },
    { $project: { _id: 0, status: '$_id', total: 1 } },
  ]);
}
