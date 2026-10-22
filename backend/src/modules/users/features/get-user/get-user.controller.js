import { getUserService } from '#src/modules/users/features/get-user/get-user.service.js';

export async function getUserController(request, reply) {
  const data = await getUserService({ userId: request.params.userId });

  return reply.success({ data });
}
