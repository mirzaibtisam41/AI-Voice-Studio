import {
  buildPaginationMetaUtil,
  buildPaginationUtil,
} from '#src/utils/index.js';
import { listAiModelsRepository } from '#src/modules/ai-models/shared/repositories/index.js';
import { buildAiModelResponseUtil } from '#src/modules/ai-models/shared/utils/index.js';

export async function listAiModelsService({ query }) {
  const { page, limit } = query;

  const { models, total } = await listAiModelsRepository({
    filters: {
      search: query.search?.trim(),
      providerId: query.providerId,
      status: query.status,
      capability: query.capability,
    },
    ...buildPaginationUtil({ page, limit }),
  });

  return {
    models: models.map((model) => buildAiModelResponseUtil({ model })),
    meta: buildPaginationMetaUtil({ page, limit, total }),
  };
}
