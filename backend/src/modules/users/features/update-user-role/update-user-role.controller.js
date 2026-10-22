import { updateUserRoleService } from '#src/modules/users/features/update-user-role/update-user-role.service.js';

export async function updateUserRoleController(request, reply) {
  const user = await updateUserRoleService({
    admin: request.user,
    userId: request.params.userId,
    role: request.body.role,
  });

  return reply.success({
    data: { user },
    message: `User role changed to ${user.role}`,
  });
}
