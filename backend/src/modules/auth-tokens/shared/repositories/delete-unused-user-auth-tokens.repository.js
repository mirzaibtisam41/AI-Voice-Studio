import { AuthTokenModel } from '#src/modules/auth-tokens/auth-token.model.js';

export function deleteUnusedUserAuthTokensRepository({
  session,
  userId,
  type,
}) {
  return AuthTokenModel.deleteMany({ userId, type, usedAt: null }, { session });
}
