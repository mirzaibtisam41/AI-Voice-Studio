import { UserModel } from '#src/modules/users/user.model.js';

export function findUserWithPasswordByEmailRepository({ email }) {
  return UserModel.findOne({ email }).select('+passwordHash');
}
