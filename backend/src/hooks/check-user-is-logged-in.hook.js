import { ForbiddenError, UnauthorizedError } from '#src/utils/index.js';
import { USER_STATUS } from '#src/modules/users/user.constants.js';
import { findLoggedInUserRepository } from '#src/modules/users/shared/repositories/index.js';

export async function checkUserIsLoggedInHook(request) {
  let tokenPayload;

  try {
    tokenPayload = await request.jwtVerify();
  } catch {
    throw new UnauthorizedError('Please log in to continue');
  }

  const user = await findLoggedInUserRepository({
    userId: tokenPayload.sub,
    familyId: tokenPayload.fid,
  });

  if (!user || user.status === USER_STATUS.DEACTIVATED) {
    throw new UnauthorizedError('Please log in to continue');
  }

  if (user.status === USER_STATUS.SUSPENDED) {
    throw new ForbiddenError(
      'This account has been suspended, please contact support',
    );
  }

  request.user = user;
  request.sessionFamilyId = tokenPayload.fid;
}
