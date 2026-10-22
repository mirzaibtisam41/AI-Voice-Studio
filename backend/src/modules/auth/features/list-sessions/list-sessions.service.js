import { listActiveAuthSessionsRepository } from '#src/modules/auth-sessions/shared/repositories/index.js';

export async function listSessionsService({ userId, currentFamilyId }) {
  const authSessions = await listActiveAuthSessionsRepository({ userId });

  return authSessions.map((authSession) => ({
    familyId: authSession.familyId,
    userAgent: authSession.userAgent,
    ipAddress: authSession.ipAddress,
    lastActiveAt: authSession.createdAt,
    expiresAt: authSession.expiresAt,
    isCurrent: authSession.familyId === currentFamilyId,
  }));
}
