import { logoutOtherSessionsService } from '#src/modules/auth/features/logout-other-sessions/logout-other-sessions.service.js';

export async function logoutOtherSessionsController(request, reply) {
  const result = await logoutOtherSessionsService({
    userId: request.user._id,
    currentFamilyId: request.sessionFamilyId,
  });

  return reply.success({
    data: result,
    message: 'Logged out from other devices',
  });
}
