import { getRealtimeOptionsService } from '#src/modules/realtime/features/get-realtime-options/get-realtime-options.service.js';

export async function getRealtimeOptionsController(_request, reply) {
  const options = await getRealtimeOptionsService();

  return reply.success({ data: options });
}
