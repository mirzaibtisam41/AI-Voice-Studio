import {
  checkUserIsAdminHook,
  checkUserIsLoggedInHook,
} from '#src/hooks/index.js';
import { getAnalyticsOverviewController } from '#src/modules/analytics/features/get-analytics-overview/get-analytics-overview.controller.js';

export async function adminAnalyticsRoutes(fastify) {
  fastify.addHook('onRequest', checkUserIsLoggedInHook);
  fastify.addHook('onRequest', checkUserIsAdminHook);

  fastify.get('/overview', getAnalyticsOverviewController);
}
