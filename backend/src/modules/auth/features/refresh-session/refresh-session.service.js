import mongoose from 'mongoose';
import {
  ForbiddenError,
  UnauthorizedError,
  hashTokenUtil,
  runInTransactionUtil,
} from '#src/utils/index.js';
import { REFRESH_TOKEN_REUSE_GRACE_SECONDS } from '#src/modules/auth-sessions/auth-session.constants.js';
import {
  findAuthSessionByTokenHashRepository,
  markAuthSessionAsReplacedRepository,
  revokeAuthSessionFamilyRepository,
} from '#src/modules/auth-sessions/shared/repositories/index.js';
import { USER_STATUS } from '#src/modules/users/user.constants.js';
import { findUserByIdRepository } from '#src/modules/users/shared/repositories/index.js';
import {
  SESSION_EXPIRED_MESSAGE,
  SUSPENDED_ACCOUNT_MESSAGE,
} from '#src/modules/auth/auth.constants.js';
import { startAuthSessionService } from '#src/modules/auth/shared/services/index.js';

function wasReplacedJustNow({ authSession }) {
  return (
    Date.now() - authSession.revokedAt.getTime() <
    REFRESH_TOKEN_REUSE_GRACE_SECONDS * 1000
  );
}

async function rejectReusedSession({ authSession }) {
  if (authSession.replacedById && !wasReplacedJustNow({ authSession })) {
    await revokeAuthSessionFamilyRepository({
      userId: authSession.userId,
      familyId: authSession.familyId,
    });
  }

  throw new UnauthorizedError(SESSION_EXPIRED_MESSAGE);
}

async function checkUserCanContinue({ authSession, user }) {
  if (user && user.status === USER_STATUS.ACTIVE) return;

  await revokeAuthSessionFamilyRepository({
    userId: authSession.userId,
    familyId: authSession.familyId,
  });

  if (user?.status === USER_STATUS.SUSPENDED) {
    throw new ForbiddenError(SUSPENDED_ACCOUNT_MESSAGE);
  }

  throw new UnauthorizedError(SESSION_EXPIRED_MESSAGE);
}

export async function refreshSessionService({ server, refreshToken, client }) {
  if (!refreshToken) {
    throw new UnauthorizedError(SESSION_EXPIRED_MESSAGE);
  }

  const authSession = await findAuthSessionByTokenHashRepository({
    refreshTokenHash: hashTokenUtil({ token: refreshToken }),
  });

  if (!authSession) {
    throw new UnauthorizedError(SESSION_EXPIRED_MESSAGE);
  }

  if (authSession.revokedAt) {
    await rejectReusedSession({ authSession });
  }

  if (authSession.expiresAt <= new Date()) {
    throw new UnauthorizedError(SESSION_EXPIRED_MESSAGE);
  }

  const user = await findUserByIdRepository({ id: authSession.userId });

  await checkUserCanContinue({ authSession, user });

  const newAuthSessionId = new mongoose.Types.ObjectId();

  const tokens = await runInTransactionUtil({
    work: async ({ session }) => {
      const replacedSession = await markAuthSessionAsReplacedRepository({
        session,
        authSessionId: authSession._id,
        replacedById: newAuthSessionId,
      });

      if (!replacedSession) {
        throw new UnauthorizedError(SESSION_EXPIRED_MESSAGE);
      }

      return startAuthSessionService({
        server,
        session,
        authSessionId: newAuthSessionId,
        userId: user._id,
        familyId: authSession.familyId,
        client,
      });
    },
  });

  return {
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    user,
  };
}
