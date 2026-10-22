import { runInTransactionUtil } from '#src/utils/index.js';
import { revokeAllUserAuthSessionsRepository } from '#src/modules/auth-sessions/shared/repositories/index.js';
import { USER_STATUS } from '#src/modules/users/user.constants.js';
import { updateUserRepository } from '#src/modules/users/shared/repositories/index.js';
import { checkUserPasswordService } from '#src/modules/users/shared/services/index.js';

export async function deactivateMyAccountService({ userId, password }) {
  await checkUserPasswordService({
    userId,
    password,
    message: 'Your password is not right',
  });

  await runInTransactionUtil({
    work: async ({ session }) => {
      await updateUserRepository({
        session,
        id: userId,
        data: { status: USER_STATUS.DEACTIVATED },
      });
      await revokeAllUserAuthSessionsRepository({ session, userId });
    },
  });
}
