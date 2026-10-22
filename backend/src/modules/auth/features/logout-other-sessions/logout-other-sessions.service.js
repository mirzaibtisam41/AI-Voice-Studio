import { revokeOtherAuthSessionFamiliesRepository } from '#src/modules/auth-sessions/shared/repositories/index.js';

export async function logoutOtherSessionsService({ userId, currentFamilyId }) {
  const loggedOutCount = await revokeOtherAuthSessionFamiliesRepository({
    userId,
    currentFamilyId,
  });

  return { loggedOutCount };
}
