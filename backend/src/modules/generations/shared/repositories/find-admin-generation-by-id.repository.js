import { GenerationModel } from '#src/modules/generations/generation.model.js';

export function findAdminGenerationByIdRepository({ generationId }) {
  return GenerationModel.findById(generationId)
    .populate('userId', 'name email role status')
    .populate('modelId', 'name slug providerModelId status');
}
