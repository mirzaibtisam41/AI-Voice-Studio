import { resendVerificationService } from '#src/modules/auth/features/resend-verification/resend-verification.service.js';

export async function resendVerificationController(request, reply) {
  const { email } = await resendVerificationService({
    server: request.server,
    user: request.user,
  });

  return reply.success({ message: `We sent a confirmation link to ${email}` });
}
