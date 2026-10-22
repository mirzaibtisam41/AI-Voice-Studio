import { revokeSessionService } from '#src/modules/auth/features/revoke-session/revoke-session.service.js';

export async function revokeSessionController(request, reply) {
  await revokeSessionService({
    userId: request.user._id,
    familyId: request.params.familyId,
  });

  return reply.success({ message: 'Session logged out' });
}
