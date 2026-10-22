import { UserModel } from '#src/modules/users/user.model.js';

export async function createUserRepository({ session, data }) {
  const [user] = await UserModel.create([data], { session });

  return user;
}
