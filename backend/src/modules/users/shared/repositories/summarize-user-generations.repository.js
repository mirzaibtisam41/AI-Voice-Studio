import { GenerationModel } from '#src/modules/generations/generation.model.js';
import { GENERATION_STATUS } from '#src/modules/generations/generation.constants.js';

export async function summarizeUserGenerationsRepository({ userId }) {
  const [summary] = await GenerationModel.aggregate([
    { $match: { userId } },
    {
      $group: {
        _id: null,
        creditsUsed: { $sum: '$creditsCharged' },
        generations: {
          $sum: {
            $cond: [{ $eq: ['$status', GENERATION_STATUS.COMPLETED] }, 1, 0],
          },
        },
      },
    },
  ]);

  return {
    creditsUsed: summary?.creditsUsed ?? 0,
    generations: summary?.generations ?? 0,
  };
}
