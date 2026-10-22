import { getMeService } from '#src/modules/auth/features/get-me/get-me.service.js';

export async function getMeController(request, reply) {
  const data = await getMeService({ user: request.user });

  return reply.success({ data });
}
