import { AiProviderModel } from '#src/modules/ai-providers/ai-provider.model.js';

export function findAiProviderByIdRepository({ session, id }) {
  return AiProviderModel.findById(id).session(session ?? null);
}
