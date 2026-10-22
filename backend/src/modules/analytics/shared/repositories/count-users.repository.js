import { UserModel } from '#src/modules/users/user.model.js';

export function countUsersRepository({ createdSince, lastLoginSince } = {}) {
  const filter = {};

  if (createdSince) filter.createdAt = { $gte: createdSince };
  if (lastLoginSince) filter.lastLoginAt = { $gte: lastLoginSince };

  return UserModel.countDocuments(filter);
}
