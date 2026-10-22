import fp from 'fastify-plugin';

async function registerConfig(fastify, { appConfig }) {
  fastify.decorate('config', appConfig);
}

export const configPlugin = fp(registerConfig);
