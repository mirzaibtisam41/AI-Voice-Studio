import fp from 'fastify-plugin';
import fastifyCors from '@fastify/cors';

async function registerCors(fastify) {
  await fastify.register(fastifyCors, {
    origin: fastify.config.CORS_ORIGIN.split(','),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  });
}

export const corsPlugin = fp(registerCors);
