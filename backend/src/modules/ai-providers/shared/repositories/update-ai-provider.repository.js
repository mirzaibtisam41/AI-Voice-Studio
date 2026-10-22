import { AiProviderModel } from '#src/modules/ai-providers/ai-provider.model.js';

export function updateAiProviderRepository({ session, id, data }) {
  return AiProviderModel.findByIdAndUpdate(id, data, {
    returnDocument: 'after',
    runValidators: true,
    session,
  });
}
