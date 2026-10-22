import { AiModelModel } from '#src/modules/ai-models/ai-model.model.js';

export async function createAiModelRepository({ session, data }) {
  const [model] = await AiModelModel.create([data], { session });

  return model.populate('providerId', 'name code status');
}
