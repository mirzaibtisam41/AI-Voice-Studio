import { REALTIME_SESSION_CAPABILITIES } from '#src/modules/realtime/realtime.constants.js';

export function buildRealtimeSessionsFilterUtil({
  userId,
  agentId,
  capability,
}) {
  const filter = {
    userId,
    capability: capability ?? { $in: REALTIME_SESSION_CAPABILITIES },
  };

  if (agentId) filter['input.agentId'] = agentId;

  return filter;
}
