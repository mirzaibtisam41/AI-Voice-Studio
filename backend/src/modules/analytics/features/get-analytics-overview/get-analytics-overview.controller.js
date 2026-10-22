import { getAnalyticsOverviewService } from '#src/modules/analytics/features/get-analytics-overview/get-analytics-overview.service.js';

export async function getAnalyticsOverviewController(request, reply) {
  const overview = await getAnalyticsOverviewService();

  return reply.success({ data: { overview } });
}
