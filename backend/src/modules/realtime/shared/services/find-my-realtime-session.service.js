import { NotFoundError } from '#src/utils/index.js';
import { findUserRealtimeSessionByIdRepository } from '#src/modules/realtime/shared/repositories/index.js';

export async function findMyRealtimeSessionService({ userId, sessionId }) {
  const session = await findUserRealtimeSessionByIdRepository({
    userId,
    sessionId,
  });

  if (!session) {
    throw new NotFoundError('Conversation not found');
  }

  return session;
}
