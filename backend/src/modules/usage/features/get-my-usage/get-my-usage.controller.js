import { getMyUsageService } from '#src/modules/usage/features/get-my-usage/get-my-usage.service.js';

export async function getMyUsageController(request, reply) {
  const usage = await getMyUsageService({
    userId: request.user._id,
    days: request.query.days,
    timezone: request.query.timezone,
  });

  return reply.success({ data: usage });
}
