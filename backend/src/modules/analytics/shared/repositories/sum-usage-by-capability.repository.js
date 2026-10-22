import { GenerationModel } from '#src/modules/generations/generation.model.js';
import { GENERATION_STATUS } from '#src/modules/generations/generation.constants.js';

export function sumUsageByCapabilityRepository({ since }) {
  return GenerationModel.aggregate([
    {
      $match: {
        status: GENERATION_STATUS.COMPLETED,
        createdAt: { $gte: since },
      },
    },
    {
      $group: {
        _id: '$capability',
        credits: { $sum: '$creditsCharged' },
        runs: { $sum: 1 },
      },
    },
  ]);
}
