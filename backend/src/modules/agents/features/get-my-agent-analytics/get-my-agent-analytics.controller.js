import { getMyAgentAnalyticsService } from '#src/modules/agents/features/get-my-agent-analytics/get-my-agent-analytics.service.js';

export async function getMyAgentAnalyticsController(request, reply) {
  const analytics = await getMyAgentAnalyticsService({
    userId: request.user._id,
    agentId: request.params.id,
    days: request.query.days,
  });

  return reply.success({ data: { analytics } });
}
