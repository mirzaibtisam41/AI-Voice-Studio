import { AiModelModel } from '#src/modules/ai-models/ai-model.model.js';

export function updateAiModelRepository({ session, id, data }) {
  return AiModelModel.findByIdAndUpdate(id, data, {
    returnDocument: 'after',
    runValidators: true,
    session,
  }).populate('providerId', 'name code status');
}
