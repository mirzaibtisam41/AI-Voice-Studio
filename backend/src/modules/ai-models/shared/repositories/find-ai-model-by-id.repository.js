import { AiModelModel } from '#src/modules/ai-models/ai-model.model.js';

export function findAiModelByIdRepository({ session, id }) {
  return AiModelModel.findById(id)
    .populate('providerId', 'name code status')
    .session(session ?? null);
}
