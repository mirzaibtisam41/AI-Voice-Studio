import { AiModelModel } from '#src/modules/ai-models/ai-model.model.js';

export function setAiModelCapabilityDefaultRepository({
  session,
  id,
  capability,
}) {
  return AiModelModel.findByIdAndUpdate(
    id,
    { $set: { 'capabilities.$[item].isDefault': true } },
    {
      arrayFilters: [{ 'item.code': capability }],
      returnDocument: 'after',
      session,
    },
  ).populate('providerId', 'name code status');
}
