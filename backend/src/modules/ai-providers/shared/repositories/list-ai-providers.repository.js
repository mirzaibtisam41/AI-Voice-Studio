import { AiProviderModel } from '#src/modules/ai-providers/ai-provider.model.js';

export function listAiProvidersRepository() {
  return AiProviderModel.aggregate([
    { $sort: { name: 1 } },
    {
      $lookup: {
        from: 'ai_models',
        localField: '_id',
        foreignField: 'providerId',
        as: 'models',
        pipeline: [{ $project: { _id: 1 } }],
      },
    },
    {
      $project: {
        _id: 0,
        id: { $toString: '$_id' },
        name: 1,
        code: 1,
        description: 1,
        status: 1,
        createdAt: 1,
        updatedAt: 1,
        modelsCount: { $size: '$models' },
      },
    },
  ]);
}
