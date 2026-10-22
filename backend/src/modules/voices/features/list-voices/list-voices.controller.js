import { listVoicesService } from '#src/modules/voices/features/list-voices/list-voices.service.js';

export async function listVoicesController(request, reply) {
  const voices = await listVoicesService();

  return reply.success({ data: { voices } });
}
