import { checkUserIsLoggedInHook } from '#src/hooks/index.js';
import { cancelRealtimeSessionController } from '#src/modules/realtime/features/cancel-realtime-session/cancel-realtime-session.controller.js';
import { cancelRealtimeSessionSchema } from '#src/modules/realtime/features/cancel-realtime-session/cancel-realtime-session.schema.js';
import { createRealtimeSessionController } from '#src/modules/realtime/features/create-realtime-session/create-realtime-session.controller.js';
import { createRealtimeSessionSchema } from '#src/modules/realtime/features/create-realtime-session/create-realtime-session.schema.js';
import { endRealtimeSessionController } from '#src/modules/realtime/features/end-realtime-session/end-realtime-session.controller.js';
import { endRealtimeSessionSchema } from '#src/modules/realtime/features/end-realtime-session/end-realtime-session.schema.js';
import { getMyRealtimeSessionController } from '#src/modules/realtime/features/get-my-realtime-session/get-my-realtime-session.controller.js';
import { getMyRealtimeSessionSchema } from '#src/modules/realtime/features/get-my-realtime-session/get-my-realtime-session.schema.js';
import { getRealtimeOptionsController } from '#src/modules/realtime/features/get-realtime-options/get-realtime-options.controller.js';
import { listMyRealtimeSessionsController } from '#src/modules/realtime/features/list-my-realtime-sessions/list-my-realtime-sessions.controller.js';
import { listMyRealtimeSessionsSchema } from '#src/modules/realtime/features/list-my-realtime-sessions/list-my-realtime-sessions.schema.js';

export async function realtimeRoutes(fastify) {
  fastify.addHook('onRequest', checkUserIsLoggedInHook);

  fastify.get('/options', getRealtimeOptionsController);

  fastify.post(
    '/sessions',
    {
      schema: createRealtimeSessionSchema,
      config: { rateLimit: { max: 6, timeWindow: 60000 } },
    },
    createRealtimeSessionController,
  );

  fastify.post(
    '/sessions/:id/end',
    { schema: endRealtimeSessionSchema },
    endRealtimeSessionController,
  );

  fastify.post(
    '/sessions/:id/cancel',
    { schema: cancelRealtimeSessionSchema },
    cancelRealtimeSessionController,
  );

  fastify.get(
    '/sessions',
    { schema: listMyRealtimeSessionsSchema },
    listMyRealtimeSessionsController,
  );

  fastify.get(
    '/sessions/:id',
    { schema: getMyRealtimeSessionSchema },
    getMyRealtimeSessionController,
  );
}
