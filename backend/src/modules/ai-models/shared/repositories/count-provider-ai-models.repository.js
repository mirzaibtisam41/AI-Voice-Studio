import { AiModelModel } from '#src/modules/ai-models/ai-model.model.js';

export function countProviderAiModelsRepository({ session, providerId }) {
  return AiModelModel.countDocuments({ providerId }).session(session ?? null);
}
