import { listAvailableVoicesService } from '#src/modules/voices/features/list-available-voices/list-available-voices.service.js';

export async function listAvailableVoicesController(request, reply) {
  const voices = await listAvailableVoicesService();

  return reply.success({ data: { voices } });
}
