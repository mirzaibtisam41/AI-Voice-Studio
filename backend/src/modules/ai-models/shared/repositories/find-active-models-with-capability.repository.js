import { AiModelModel } from '#src/modules/ai-models/ai-model.model.js';
import { AI_MODEL_STATUS } from '#src/modules/ai-models/ai-model.constants.js';

export function findActiveModelsWithCapabilityRepository({ capability }) {
  return AiModelModel.find({
    status: AI_MODEL_STATUS.ACTIVE,
    capabilities: {
      $elemMatch: {
        code: capability,
        enabled: true,
        creditsPerUnit: { $gte: 1 },
      },
    },
  })
    .populate('providerId', 'name code status')
    .sort({ name: 1 });
}
