import { NotFoundError } from '#src/utils/index.js';
import { updateUserRepository } from '#src/modules/users/shared/repositories/index.js';

export async function updateMyProfileService({ userId, name }) {
  const user = await updateUserRepository({
    id: userId,
    data: { name: name.trim() },
  });

  if (!user) {
    throw new NotFoundError('User not found');
  }

  return user;
}
