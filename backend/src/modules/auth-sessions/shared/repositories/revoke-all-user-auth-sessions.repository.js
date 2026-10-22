import { AuthSessionModel } from '#src/modules/auth-sessions/auth-session.model.js';

export async function revokeAllUserAuthSessionsRepository({ session, userId }) {
  const result = await AuthSessionModel.updateMany(
    { userId, revokedAt: null },
    { $set: { revokedAt: new Date() } },
    { session },
  );

  return result.modifiedCount;
}
