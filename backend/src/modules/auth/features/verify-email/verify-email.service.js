import { BadRequestError, runInTransactionUtil } from '#src/utils/index.js';
import { AUTH_TOKEN_TYPE } from '#src/modules/auth-tokens/auth-token.constants.js';
import { useAuthTokenService } from '#src/modules/auth-tokens/shared/services/index.js';
import {
  findUserByIdRepository,
  markUserEmailVerifiedRepository,
} from '#src/modules/users/shared/repositories/index.js';

export async function verifyEmailService({ token }) {
  const user = await runInTransactionUtil({
    work: async ({ session }) => {
      const usedToken = await useAuthTokenService({
        session,
        token,
        type: AUTH_TOKEN_TYPE.EMAIL_VERIFY,
      });

      if (!usedToken) {
        throw new BadRequestError(
          'This confirmation link is not valid anymore. Ask for a new one.',
        );
      }

      await markUserEmailVerifiedRepository({ session, id: usedToken.userId });

      return findUserByIdRepository({ session, id: usedToken.userId });
    },
  });

  return { email: user.email, emailVerifiedAt: user.emailVerifiedAt };
}
