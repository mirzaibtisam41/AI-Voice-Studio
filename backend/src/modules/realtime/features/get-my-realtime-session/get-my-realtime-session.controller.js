import { getMyRealtimeSessionService } from '#src/modules/realtime/features/get-my-realtime-session/get-my-realtime-session.service.js';

export async function getMyRealtimeSessionController(request, reply) {
  const session = await getMyRealtimeSessionService({
    userId: request.user._id,
    sessionId: request.params.id,
  });

  return reply.success({ data: { session } });
}
