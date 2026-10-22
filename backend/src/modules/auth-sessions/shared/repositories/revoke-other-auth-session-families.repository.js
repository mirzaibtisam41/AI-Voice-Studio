import { AuthSessionModel } from '#src/modules/auth-sessions/auth-session.model.js';

export async function revokeOtherAuthSessionFamiliesRepository({
  session,
  userId,
  currentFamilyId,
}) {
  const result = await AuthSessionModel.updateMany(
    { userId, familyId: { $ne: currentFamilyId }, revokedAt: null },
    { $set: { revokedAt: new Date() } },
    { session },
  );

  return result.modifiedCount;
}
