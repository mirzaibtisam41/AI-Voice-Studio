import { AiModelModel } from '#src/modules/ai-models/ai-model.model.js';

export function findCapabilityDefaultModelRepository({
  session,
  capability,
  exceptModelId,
}) {
  return AiModelModel.findOne({
    _id: { $ne: exceptModelId },
    capabilities: { $elemMatch: { code: capability, isDefault: true } },
  }).session(session ?? null);
}
