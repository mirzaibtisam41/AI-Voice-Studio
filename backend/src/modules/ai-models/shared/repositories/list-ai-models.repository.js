import { escapeRegexUtil } from '#src/utils/index.js';
import { AiModelModel } from '#src/modules/ai-models/ai-model.model.js';

function buildFilter({ search, providerId, status, capability }) {
  const filter = {};

  if (search) {
    const pattern = new RegExp(escapeRegexUtil({ text: search }), 'i');

    filter.$or = [
      { name: pattern },
      { slug: pattern },
      { providerModelId: pattern },
    ];
  }

  if (providerId) filter.providerId = providerId;
  if (status) filter.status = status;
  if (capability) {
    filter.capabilities = { $elemMatch: { code: capability, enabled: true } };
  }

  return filter;
}

export async function listAiModelsRepository({ filters, skip, limit }) {
  const filter = buildFilter(filters);

  const [models, total] = await Promise.all([
    AiModelModel.find(filter)
      .populate('providerId', 'name code status')
      .sort({ name: 1, _id: 1 })
      .skip(skip)
      .limit(limit),
    AiModelModel.countDocuments(filter),
  ]);

  return { models, total };
}
