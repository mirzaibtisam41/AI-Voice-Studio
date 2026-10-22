import { GenerationModel } from '#src/modules/generations/generation.model.js';

export function countWeeklyGenerationsRepository({ since }) {
  return GenerationModel.aggregate([
    { $match: { createdAt: { $gte: since } } },
    {
      $group: {
        _id: {
          $dateTrunc: {
            date: '$createdAt',
            unit: 'week',
            startOfWeek: 'monday',
          },
        },
        count: { $sum: 1 },
      },
    },
  ]);
}
