import { forgotPasswordService } from '#src/modules/auth/features/forgot-password/forgot-password.service.js';

export async function forgotPasswordController(request, reply) {
  await forgotPasswordService({
    server: request.server,
    email: request.body.email,
  });

  return reply.success({
    message:
      'If an account uses this email, we sent it a link to reset the password.',
  });
}
