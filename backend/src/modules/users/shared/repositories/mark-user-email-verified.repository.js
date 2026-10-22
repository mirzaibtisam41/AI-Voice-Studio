import { UserModel } from '#src/modules/users/user.model.js';

export function markUserEmailVerifiedRepository({ session, id }) {
  return UserModel.updateOne(
    { _id: id, emailVerifiedAt: null },
    { $set: { emailVerifiedAt: new Date() } },
    { session },
  );
}
