import { listMyRealtimeSessionsService } from '#src/modules/realtime/features/list-my-realtime-sessions/list-my-realtime-sessions.service.js';

export async function listMyRealtimeSessionsController(request, reply) {
  const { sessions, meta } = await listMyRealtimeSessionsService({
    userId: request.user._id,
    query: request.query,
  });

  return reply.success({ data: { sessions }, meta });
}
