import { ForbiddenError } from '#src/utils/index.js';
import { USER_ROLE } from '#src/modules/users/user.constants.js';

export async function checkUserIsAdminHook(request) {
  if (request.user?.role !== USER_ROLE.ADMIN) {
    throw new ForbiddenError('Admin access required');
  }
}
