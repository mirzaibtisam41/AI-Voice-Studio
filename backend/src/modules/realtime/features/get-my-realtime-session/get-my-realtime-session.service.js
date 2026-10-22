import { findMyRealtimeSessionService } from '#src/modules/realtime/shared/services/index.js';
import { presentRealtimeSessionUtil } from '#src/modules/realtime/shared/utils/index.js';

export async function getMyRealtimeSessionService({ userId, sessionId }) {
  const session = await findMyRealtimeSessionService({ userId, sessionId });

  return presentRealtimeSessionUtil({ session });
}
