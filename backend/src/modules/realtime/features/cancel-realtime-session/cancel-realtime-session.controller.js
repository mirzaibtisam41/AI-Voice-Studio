import { cancelRealtimeSessionService } from '#src/modules/realtime/features/cancel-realtime-session/cancel-realtime-session.service.js';

export async function cancelRealtimeSessionController(request, reply) {
  const result = await cancelRealtimeSessionService({
    userId: request.user._id,
    sessionId: request.params.id,
  });

  return reply.success({ data: result, message: 'Conversation cancelled' });
}
