import mongoose from 'mongoose';
import { AuthSessionModel } from '#src/modules/auth-sessions/auth-session.model.js';
import { UserModel } from '#src/modules/users/user.model.js';

export async function findLoggedInUserRepository({ userId, familyId }) {
  if (!mongoose.isValidObjectId(userId) || !familyId) return null;

  const activeSession = await AuthSessionModel.exists({
    userId,
    familyId,
    revokedAt: null,
    expiresAt: { $gt: new Date() },
  });

  if (!activeSession) return null;

  return UserModel.findById(userId);
}
