import { UserModel } from '#src/modules/users/user.model.js';

export function findWalletUserRepository({ session, userId }) {
  return UserModel.findById(userId)
    .select('name email')
    .session(session ?? null);
}
