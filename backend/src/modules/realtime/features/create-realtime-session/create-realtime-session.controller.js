import { StatusCodes } from 'http-status-codes';
import { createRealtimeSessionService } from '#src/modules/realtime/features/create-realtime-session/create-realtime-session.service.js';

export async function createRealtimeSessionController(request, reply) {
  const session = await createRealtimeSessionService({
    server: request.server,
    log: request.log,
    userId: request.user._id,
    data: request.body ?? {},
  });

  return reply.success({
    data: session,
    message: 'Conversation ready',
    statusCode: StatusCodes.CREATED,
  });
}
