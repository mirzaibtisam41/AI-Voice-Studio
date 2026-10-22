import { getGenerationStatsService } from '#src/modules/generations/features/get-generation-stats/get-generation-stats.service.js';

export async function getGenerationStatsController(_request, reply) {
  const stats = await getGenerationStatsService();

  return reply.success({ data: stats });
}
