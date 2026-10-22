import { AiProviderModel } from '#src/modules/ai-providers/ai-provider.model.js';

export function deleteAiProviderRepository({ session, id }) {
  return AiProviderModel.findByIdAndDelete(id, { session });
}
