import { AiProviderModel } from '#src/modules/ai-providers/ai-provider.model.js';

export async function createAiProviderRepository({ session, data }) {
  const [provider] = await AiProviderModel.create([data], { session });

  return provider;
}
