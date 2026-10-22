import { UserModel } from '#src/modules/users/user.model.js';

export function findUserByIdRepository({ session, id }) {
  return UserModel.findById(id).session(session ?? null);
}
