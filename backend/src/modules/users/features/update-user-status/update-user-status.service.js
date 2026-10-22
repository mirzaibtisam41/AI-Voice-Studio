import {
  BadRequestError,
  NotFoundError,
  runInTransactionUtil,
} from '#src/utils/index.js';
import {
  AUDIT_ACTION,
  AUDIT_TARGET_TYPE,
} from '#src/modules/audit-logs/audit-log.constants.js';
import { recordAuditLogService } from '#src/modules/audit-logs/shared/services/index.js';
import { revokeAllUserAuthSessionsRepository } from '#src/modules/auth-sessions/shared/repositories/index.js';
import { USER_STATUS } from '#src/modules/users/user.constants.js';
import {
  findUserByIdRepository,
  updateUserRepository,
} from '#src/modules/users/shared/repositories/index.js';

export async function updateUserStatusService({ admin, userId, status }) {
  if (admin._id.equals(userId)) {
    throw new BadRequestError(
      'You cannot change the status of your own account',
    );
  }

  return runInTransactionUtil({
    work: async ({ session }) => {
      const user = await findUserByIdRepository({ session, id: userId });

      if (!user) {
        throw new NotFoundError('User not found');
      }

      const updatedUser = await updateUserRepository({
        session,
        id: user._id,
        data: { status },
      });

      if (status === USER_STATUS.SUSPENDED) {
        await revokeAllUserAuthSessionsRepository({
          session,
          userId: user._id,
        });
      }

      await recordAuditLogService({
        session,
        actor: admin,
        action: AUDIT_ACTION.USER_STATUS_CHANGED,
        targetType: AUDIT_TARGET_TYPE.USER,
        targetId: user._id,
        targetLabel: user.email,
        details: { before: { status: user.status }, after: { status } },
      });

      return updatedUser;
    },
  });
}
