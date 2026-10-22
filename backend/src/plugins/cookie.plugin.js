import fp from 'fastify-plugin';
import fastifyCookie from '@fastify/cookie';

async function registerCookie(fastify) {
  await fastify.register(fastifyCookie);
}

export const cookiePlugin = fp(registerCookie);
