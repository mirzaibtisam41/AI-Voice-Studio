import {
  buildPaginationMetaUtil,
  buildPaginationUtil,
} from '#src/utils/index.js';
import {
  countUserRealtimeSessionsRepository,
  listUserRealtimeSessionsRepository,
} from '#src/modules/realtime/shared/repositories/index.js';
import {
  buildRealtimeSessionsFilterUtil,
  presentRealtimeSessionUtil,
} from '#src/modules/realtime/shared/utils/index.js';

export async function listMyRealtimeSessionsService({ userId, query }) {
  const { page, limit } = query;
  const { skip } = buildPaginationUtil({ page, limit });
  const filter = buildRealtimeSessionsFilterUtil({
    userId,
    agentId: query.agentId,
    capability: query.capability,
  });

  const [sessions, total] = await Promise.all([
    listUserRealtimeSessionsRepository({ filter, skip, limit }),
    countUserRealtimeSessionsRepository({ filter }),
  ]);

  return {
    sessions: sessions.map((session) =>
      presentRealtimeSessionUtil({ session, includeTranscript: false }),
    ),
    meta: buildPaginationMetaUtil({ page, limit, total }),
  };
}
