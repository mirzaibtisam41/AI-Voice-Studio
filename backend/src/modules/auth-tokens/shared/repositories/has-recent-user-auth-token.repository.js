import { AuthTokenModel } from '#src/modules/auth-tokens/auth-token.model.js';

export async function hasRecentUserAuthTokenRepository({
  userId,
  type,
  withinSeconds,
}) {
  const token = await AuthTokenModel.exists({
    userId,
    type,
    createdAt: { $gt: new Date(Date.now() - withinSeconds * 1000) },
  });

  return Boolean(token);
}
