import { AuthSessionModel } from '#src/modules/auth-sessions/auth-session.model.js';

export function listActiveAuthSessionsRepository({ userId }) {
  return AuthSessionModel.find({
    userId,
    revokedAt: null,
    expiresAt: { $gt: new Date() },
  })
    .select('familyId userAgent ipAddress createdAt expiresAt')
    .sort({ createdAt: -1, _id: -1 })
    .lean();
}
