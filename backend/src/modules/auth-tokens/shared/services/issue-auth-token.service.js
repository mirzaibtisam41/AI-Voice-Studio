import {
  generateTokenUtil,
  hashTokenUtil,
  runInTransactionUtil,
} from '#src/utils/index.js';
import {
  createAuthTokenRepository,
  deleteUnusedUserAuthTokensRepository,
} from '#src/modules/auth-tokens/shared/repositories/index.js';

export async function issueAuthTokenService({ userId, type, validForMinutes }) {
  const token = generateTokenUtil();

  await runInTransactionUtil({
    work: async ({ session }) => {
      await deleteUnusedUserAuthTokensRepository({ session, userId, type });
      await createAuthTokenRepository({
        session,
        data: {
          userId,
          type,
          tokenHash: hashTokenUtil({ token }),
          expiresAt: new Date(Date.now() + validForMinutes * 60 * 1000),
        },
      });
    },
  });

  return token;
}
