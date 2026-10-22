import { UserModel } from '#src/modules/users/user.model.js';

export function updateUserLastLoginAtRepository({ userId }) {
  return UserModel.updateOne(
    { _id: userId },
    { $set: { lastLoginAt: new Date() } },
  );
}
