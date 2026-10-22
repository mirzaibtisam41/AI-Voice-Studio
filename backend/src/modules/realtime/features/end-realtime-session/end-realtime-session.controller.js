import { endRealtimeSessionService } from '#src/modules/realtime/features/end-realtime-session/end-realtime-session.service.js';

export async function endRealtimeSessionController(request, reply) {
  const result = await endRealtimeSessionService({
    userId: request.user._id,
    sessionId: request.params.id,
    data: request.body,
  });

  return reply.success({ data: result, message: 'Conversation ended' });
}
