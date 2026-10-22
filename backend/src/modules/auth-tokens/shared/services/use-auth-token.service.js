import { hashTokenUtil } from '#src/utils/index.js';
import { useAuthTokenRepository } from '#src/modules/auth-tokens/shared/repositories/index.js';

export function useAuthTokenService({ session, token, type }) {
  return useAuthTokenRepository({
    session,
    tokenHash: hashTokenUtil({ token }),
    type,
  });
}
