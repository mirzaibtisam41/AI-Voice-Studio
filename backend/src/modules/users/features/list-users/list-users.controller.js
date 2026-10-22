import { listUsersService } from '#src/modules/users/features/list-users/list-users.service.js';

export async function listUsersController(request, reply) {
  const { users, meta } = await listUsersService({ query: request.query });

  return reply.success({ data: { users }, meta });
}
