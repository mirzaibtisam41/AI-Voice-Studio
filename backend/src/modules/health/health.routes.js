import { checkHealthController } from '#src/modules/health/health.controller.js';

export function healthRoutes(fastify) {
  fastify.get('/', checkHealthController);
}
