import { verifyEmailService } from '#src/modules/auth/features/verify-email/verify-email.service.js';

export async function verifyEmailController(request, reply) {
  const result = await verifyEmailService({ token: request.body.token });

  return reply.success({ data: result, message: 'Your email is confirmed' });
}
