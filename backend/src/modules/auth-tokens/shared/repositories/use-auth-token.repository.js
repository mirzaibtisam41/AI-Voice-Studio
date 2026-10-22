import { AuthTokenModel } from '#src/modules/auth-tokens/auth-token.model.js';

export function useAuthTokenRepository({ session, tokenHash, type }) {
  const now = new Date();

  return AuthTokenModel.findOneAndUpdate(
    { tokenHash, type, usedAt: null, expiresAt: { $gt: now } },
    { $set: { usedAt: now } },
    { returnDocument: 'after', session },
  );
}
