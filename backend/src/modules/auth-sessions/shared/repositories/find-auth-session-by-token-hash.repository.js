import { AuthSessionModel } from '#src/modules/auth-sessions/auth-session.model.js';

export function findAuthSessionByTokenHashRepository({ refreshTokenHash }) {
  return AuthSessionModel.findOne({ refreshTokenHash });
}
