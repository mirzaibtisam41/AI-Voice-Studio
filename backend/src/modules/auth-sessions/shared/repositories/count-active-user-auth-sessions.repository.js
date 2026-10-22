import { AuthSessionModel } from '#src/modules/auth-sessions/auth-session.model.js';

export function countActiveUserAuthSessionsRepository({ userId }) {
  return AuthSessionModel.countDocuments({
    userId,
    revokedAt: null,
    expiresAt: { $gt: new Date() },
  });
}
