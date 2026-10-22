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
import {
  findUserByIdRepository,
  updateUserRepository,
} from '#src/modules/users/shared/repositories/index.js';

export async function updateUserRoleService({ admin, userId, role }) {
  if (admin._id.equals(userId)) {
    throw new BadRequestError('You cannot change the role of your own account');
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
        data: { role },
      });

      await recordAuditLogService({
        session,
        actor: admin,
        action: AUDIT_ACTION.USER_ROLE_CHANGED,
        targetType: AUDIT_TARGET_TYPE.USER,
        targetId: user._id,
        targetLabel: user.email,
        details: { before: { role: user.role }, after: { role } },
      });

      return updatedUser;
    },
  });
}
