import {
  BadRequestError,
  hashPasswordUtil,
  runInTransactionUtil,
} from '#src/utils/index.js';
import { revokeAllUserAuthSessionsRepository } from '#src/modules/auth-sessions/shared/repositories/index.js';
import { AUTH_TOKEN_TYPE } from '#src/modules/auth-tokens/auth-token.constants.js';
import { useAuthTokenService } from '#src/modules/auth-tokens/shared/services/index.js';
import {
  markUserEmailVerifiedRepository,
  updateUserRepository,
} from '#src/modules/users/shared/repositories/index.js';

export async function resetPasswordService({ token, password }) {
  const passwordHash = await hashPasswordUtil({ password });

  await runInTransactionUtil({
    work: async ({ session }) => {
      const usedToken = await useAuthTokenService({
        session,
        token,
        type: AUTH_TOKEN_TYPE.PASSWORD_RESET,
      });

      if (!usedToken) {
        throw new BadRequestError(
          'This reset link is not valid anymore. Ask for a new one.',
        );
      }

      await updateUserRepository({
        session,
        id: usedToken.userId,
        data: { passwordHash },
      });
      await markUserEmailVerifiedRepository({ session, id: usedToken.userId });
      await revokeAllUserAuthSessionsRepository({
        session,
        userId: usedToken.userId,
      });
    },
  });
}
