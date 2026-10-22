import fp from 'fastify-plugin';
import fastifyHelmet from '@fastify/helmet';

async function registerHelmet(fastify) {
  await fastify.register(fastifyHelmet);
}

export const helmetPlugin = fp(registerHelmet);
