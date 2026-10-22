import fp from 'fastify-plugin';
import fastifyRateLimit from '@fastify/rate-limit';
import { TooManyRequestsError } from '#src/utils/index.js';

async function registerRateLimit(fastify) {
  await fastify.register(fastifyRateLimit, {
    global: true,
    max: 100,
    timeWindow: 60000,
    errorResponseBuilder: (_request, context) =>
      new TooManyRequestsError(
        `Too many requests, please try again in ${context.after}`,
      ),
  });
}

export const rateLimitPlugin = fp(registerRateLimit);
