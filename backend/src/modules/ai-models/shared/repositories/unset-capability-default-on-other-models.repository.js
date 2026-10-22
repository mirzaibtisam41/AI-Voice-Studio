import { AiModelModel } from '#src/modules/ai-models/ai-model.model.js';

export function unsetCapabilityDefaultOnOtherModelsRepository({
  session,
  capability,
  exceptModelId,
}) {
  return AiModelModel.updateMany(
    {
      _id: { $ne: exceptModelId },
      capabilities: { $elemMatch: { code: capability, isDefault: true } },
    },
    { $set: { 'capabilities.$[item].isDefault': false } },
    { arrayFilters: [{ 'item.code': capability }], session },
  );
}
