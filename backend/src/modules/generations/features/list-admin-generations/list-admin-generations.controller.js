import { listAdminGenerationsService } from '#src/modules/generations/features/list-admin-generations/list-admin-generations.service.js';

export async function listAdminGenerationsController(request, reply) {
  const { generations, meta } = await listAdminGenerationsService({
    query: request.query,
  });

  return reply.success({ data: { generations }, meta });
}
