import {
  buildPaginationMetaUtil,
  buildPaginationUtil,
} from '#src/utils/index.js';
import {
  countGenerationsByStatusRepository,
  countGenerationsRepository,
  listGenerationsRepository,
} from '#src/modules/generations/shared/repositories/index.js';
import {
  buildStatusCountsUtil,
  presentGenerationSummaryUtil,
} from '#src/modules/generations/shared/utils/index.js';

export async function listMyGenerationsService({ userId, query }) {
  const { page, limit } = query;
  const { skip } = buildPaginationUtil({ page, limit });
  const baseFilter = { userId };

  if (query.capability) baseFilter.capability = query.capability;

  const filter = query.status
    ? { ...baseFilter, status: query.status }
    : baseFilter;

  const [generations, total, statusRows] = await Promise.all([
    listGenerationsRepository({ filter, skip, limit }),
    countGenerationsRepository({ filter }),
    countGenerationsByStatusRepository({ filter: baseFilter }),
  ]);

  return {
    generations: generations.map((generation) =>
      presentGenerationSummaryUtil({ generation }),
    ),
    counts: buildStatusCountsUtil({ rows: statusRows }),
    meta: buildPaginationMetaUtil({ page, limit, total }),
  };
}
