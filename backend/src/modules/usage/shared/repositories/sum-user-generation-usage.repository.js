import { GenerationModel } from '#src/modules/generations/generation.model.js';

export function sumUserGenerationUsageRepository({ userId, since, timezone }) {
  return GenerationModel.aggregate([
    { $match: { userId, createdAt: { $gte: since } } },
    {
      $group: {
        _id: {
          day: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$createdAt',
              timezone,
            },
          },
          capability: '$capability',
          status: '$status',
        },
        credits: { $sum: '$creditsCharged' },
        units: { $sum: '$units' },
        runs: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        day: '$_id.day',
        capability: '$_id.capability',
        status: '$_id.status',
        credits: 1,
        units: 1,
        runs: 1,
      },
    },
  ]);
}
