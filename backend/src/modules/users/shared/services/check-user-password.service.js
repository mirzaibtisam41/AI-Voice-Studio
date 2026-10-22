import { BadRequestError, verifyPasswordUtil } from '#src/utils/index.js';
import { findUserPasswordHashByIdRepository } from '#src/modules/users/shared/repositories/index.js';

async function isPasswordCorrect({ password, passwordHash }) {
  if (!passwordHash) return false;

  try {
    return await verifyPasswordUtil({ password, passwordHash });
  } catch {
    return false;
  }
}

export async function checkUserPasswordService({ userId, password, message }) {
  const passwordHash = await findUserPasswordHashByIdRepository({
    id: userId,
  });

  if (!(await isPasswordCorrect({ password, passwordHash }))) {
    throw new BadRequestError(message);
  }
}
