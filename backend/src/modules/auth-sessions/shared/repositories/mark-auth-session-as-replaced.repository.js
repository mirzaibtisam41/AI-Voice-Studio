import { AuthSessionModel } from '#src/modules/auth-sessions/auth-session.model.js';

export function markAuthSessionAsReplacedRepository({
  session,
  authSessionId,
  replacedById,
}) {
  const now = new Date();

  return AuthSessionModel.findOneAndUpdate(
    { _id: authSessionId, revokedAt: null },
    { $set: { replacedById, revokedAt: now, lastUsedAt: now } },
    { returnDocument: 'after', session },
  );
}
