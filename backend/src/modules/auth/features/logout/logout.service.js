import { hashTokenUtil } from '#src/utils/index.js';
import {
  findAuthSessionByTokenHashRepository,
  revokeAuthSessionFamilyRepository,
} from '#src/modules/auth-sessions/shared/repositories/index.js';

export async function logoutService({ refreshToken }) {
  if (!refreshToken) return;

  const authSession = await findAuthSessionByTokenHashRepository({
    refreshTokenHash: hashTokenUtil({ token: refreshToken }),
  });

  if (!authSession) return;

  await revokeAuthSessionFamilyRepository({
    userId: authSession.userId,
    familyId: authSession.familyId,
  });
}
