import { AuthSessionModel } from '#src/modules/auth-sessions/auth-session.model.js';

export async function revokeAuthSessionFamilyRepository({
  session,
  userId,
  familyId,
}) {
  const result = await AuthSessionModel.updateMany(
    { userId, familyId, revokedAt: null },
    { $set: { revokedAt: new Date() } },
    { session },
  );

  return result.modifiedCount;
}
