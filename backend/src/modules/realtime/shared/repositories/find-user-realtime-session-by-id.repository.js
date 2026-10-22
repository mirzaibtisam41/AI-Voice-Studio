import { GenerationModel } from '#src/modules/generations/generation.model.js';
import { REALTIME_SESSION_CAPABILITIES } from '#src/modules/realtime/realtime.constants.js';

export function findUserRealtimeSessionByIdRepository({ userId, sessionId }) {
  return GenerationModel.findOne({
    _id: sessionId,
    userId,
    capability: { $in: REALTIME_SESSION_CAPABILITIES },
  });
}
