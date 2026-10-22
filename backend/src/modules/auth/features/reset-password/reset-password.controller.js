import { resetPasswordService } from '#src/modules/auth/features/reset-password/reset-password.service.js';

export async function resetPasswordController(request, reply) {
  await resetPasswordService({
    token: request.body.token,
    password: request.body.password,
  });

  return reply.success({
    message: 'Password changed. Log in with your new password.',
  });
}
