import mongoose from 'mongoose';
import { generateTokenUtil, hashTokenUtil } from '#src/utils/index.js';
import { REFRESH_TOKEN_TTL_DAYS } from '#src/modules/auth-sessions/auth-session.constants.js';
import { createAuthSessionRepository } from '#src/modules/auth-sessions/shared/repositories/index.js';

export async function startAuthSessionService({
  server,
  session,
  authSessionId = new mongoose.Types.ObjectId(),
  userId,
  familyId,
  client,
}) {
  const refreshToken = generateTokenUtil();

  const authSession = await createAuthSessionRepository({
    session,
    data: {
      _id: authSessionId,
      userId,
      familyId,
      refreshTokenHash: hashTokenUtil({ token: refreshToken }),
      userAgent: client.userAgent,
      ipAddress: client.ipAddress,
      expiresAt: new Date(
        Date.now() + REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000,
      ),
    },
  });

  const accessToken = server.jwt.sign({
    sub: userId.toString(),
    fid: familyId,
  });

  return { authSession, accessToken, refreshToken };
}
