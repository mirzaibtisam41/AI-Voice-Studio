import { GenerationModel } from '#src/modules/generations/generation.model.js';
import { GENERATION_STATUS } from '#src/modules/generations/generation.constants.js';

export function listAgentGenerationsRepository({
  userId,
  agentId,
  capabilities,
  since,
}) {
  return GenerationModel.find({
    userId,
    'input.agentId': agentId,
    capability: { $in: capabilities },
    status: { $ne: GENERATION_STATUS.FAILED },
    createdAt: { $gte: since },
  })
    .select(
      'capability status units creditsCharged output.durationSeconds createdAt',
    )
    .lean();
}
