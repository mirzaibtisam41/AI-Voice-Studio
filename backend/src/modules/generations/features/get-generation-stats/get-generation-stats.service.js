import { GENERATION_STATS_HOURS } from '#src/modules/generations/generation-history.constants.js';
import { countGenerationsByStatusRepository } from '#src/modules/generations/shared/repositories/index.js';
import { buildStatusCountsUtil } from '#src/modules/generations/shared/utils/index.js';

export async function getGenerationStatsService({ now = new Date() } = {}) {
  const since = new Date(
    now.getTime() - GENERATION_STATS_HOURS * 60 * 60 * 1000,
  );
  const rows = await countGenerationsByStatusRepository({
    filter: { createdAt: { $gte: since } },
  });

  return {
    since,
    hours: GENERATION_STATS_HOURS,
    counts: buildStatusCountsUtil({ rows }),
  };
}
