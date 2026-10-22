import { GenerationModel } from '#src/modules/generations/generation.model.js';
import { GENERATION_STATUS } from '#src/modules/generations/generation.constants.js';

export function listRecentFailedGenerationsRepository({ limit }) {
  return GenerationModel.find({ status: GENERATION_STATUS.FAILED })
    .select('userId capability errorCategory createdAt')
    .populate('userId', 'email')
    .sort({ createdAt: -1, _id: -1 })
    .limit(limit);
}
