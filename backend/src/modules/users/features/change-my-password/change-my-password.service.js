import {
  BadRequestError,
  hashPasswordUtil,
  runInTransactionUtil,
} from '#src/utils/index.js';
import { revokeOtherAuthSessionFamiliesRepository } from '#src/modules/auth-sessions/shared/repositories/index.js';
import { updateUserRepository } from '#src/modules/users/shared/repositories/index.js';
import { checkUserPasswordService } from '#src/modules/users/shared/services/index.js';

export async function changeMyPasswordService({
  userId,
  currentFamilyId,
  currentPassword,
  newPassword,
}) {
  await checkUserPasswordService({
    userId,
    password: currentPassword,
    message: 'Your current password is not right',
  });

  if (currentPassword === newPassword) {
    throw new BadRequestError(
      'Choose a password different from the current one',
    );
  }

  const passwordHash = await hashPasswordUtil({ password: newPassword });

  const loggedOutCount = await runInTransactionUtil({
    work: async ({ session }) => {
      await updateUserRepository({
        session,
        id: userId,
        data: { passwordHash },
      });

      return revokeOtherAuthSessionFamiliesRepository({
        session,
        userId,
        currentFamilyId,
      });
    },
  });

  return { loggedOutCount };
}
