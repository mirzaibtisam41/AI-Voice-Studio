import { randomUUID } from 'node:crypto';
import {
  ForbiddenError,
  UnauthorizedError,
  hashPasswordUtil,
  verifyPasswordUtil,
} from '#src/utils/index.js';
import { getPlatformSettingsService } from '#src/modules/platform-settings/shared/services/index.js';
import { USER_STATUS } from '#src/modules/users/user.constants.js';
import {
  findUserWithPasswordByEmailRepository,
  updateUserLastLoginAtRepository,
} from '#src/modules/users/shared/repositories/index.js';
import { toPublicUserUtil } from '#src/modules/users/shared/utils/index.js';
import {
  INCORRECT_LOGIN_MESSAGE,
  SUSPENDED_ACCOUNT_MESSAGE,
} from '#src/modules/auth/auth.constants.js';
import { startAuthSessionService } from '#src/modules/auth/shared/services/index.js';

const PASSWORD_HASH_FOR_UNKNOWN_EMAIL = await hashPasswordUtil({
  password: 'password-for-unknown-email-1',
});

async function isPasswordCorrect({ password, passwordHash }) {
  try {
    return await verifyPasswordUtil({ password, passwordHash });
  } catch {
    return false;
  }
}

export async function loginService({ server, data, client }) {
  const user = await findUserWithPasswordByEmailRepository({
    email: data.email.trim().toLowerCase(),
  });

  const isCorrect = await isPasswordCorrect({
    password: data.password,
    passwordHash: user?.passwordHash ?? PASSWORD_HASH_FOR_UNKNOWN_EMAIL,
  });

  if (!user || !isCorrect || user.status === USER_STATUS.DEACTIVATED) {
    throw new UnauthorizedError(INCORRECT_LOGIN_MESSAGE);
  }

  if (user.status === USER_STATUS.SUSPENDED) {
    throw new ForbiddenError(SUSPENDED_ACCOUNT_MESSAGE);
  }

  const settings = await getPlatformSettingsService();

  if (settings.requireEmailVerification && !user.emailVerifiedAt) {
    throw new ForbiddenError('Please confirm your email first');
  }

  const { accessToken, refreshToken } = await startAuthSessionService({
    server,
    userId: user._id,
    familyId: randomUUID(),
    client,
  });

  await updateUserLastLoginAtRepository({ userId: user._id });

  user.lastLoginAt = new Date();

  return { accessToken, refreshToken, user: toPublicUserUtil({ user }) };
}
