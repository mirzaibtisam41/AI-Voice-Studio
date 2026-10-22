import { changeMyPasswordService } from '#src/modules/users/features/change-my-password/change-my-password.service.js';

export async function changeMyPasswordController(request, reply) {
  const result = await changeMyPasswordService({
    userId: request.user._id,
    currentFamilyId: request.sessionFamilyId,
    currentPassword: request.body.currentPassword,
    newPassword: request.body.newPassword,
  });

  return reply.success({ data: result, message: 'Password changed' });
}
