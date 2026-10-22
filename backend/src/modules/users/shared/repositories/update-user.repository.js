import { UserModel } from '#src/modules/users/user.model.js';

export function updateUserRepository({ session, id, data }) {
  return UserModel.findByIdAndUpdate(
    id,
    { $set: data },
    { returnDocument: 'after', runValidators: true, session },
  );
}
