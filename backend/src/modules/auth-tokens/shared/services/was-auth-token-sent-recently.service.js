import { hasRecentUserAuthTokenRepository } from '#src/modules/auth-tokens/shared/repositories/index.js';

export function wasAuthTokenSentRecentlyService({
  userId,
  type,
  withinSeconds,
}) {
  return hasRecentUserAuthTokenRepository({ userId, type, withinSeconds });
}
