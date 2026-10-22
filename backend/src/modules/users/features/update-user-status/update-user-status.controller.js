import { updateUserStatusService } from '#src/modules/users/features/update-user-status/update-user-status.service.js';

export async function updateUserStatusController(request, reply) {
  const user = await updateUserStatusService({
    admin: request.user,
    userId: request.params.userId,
    status: request.body.status,
  });

  return reply.success({
    data: { user },
    message: `User status changed to ${user.status}`,
  });
}
