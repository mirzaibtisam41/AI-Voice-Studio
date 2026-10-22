import { UserModel } from '#src/modules/users/user.model.js';

export async function findUserPasswordHashByIdRepository({ id }) {
  const user = await UserModel.findById(id).select('+passwordHash').lean();

  return user?.passwordHash ?? null;
}
