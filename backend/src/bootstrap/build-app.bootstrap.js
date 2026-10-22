import Fastify from 'fastify';
import { randomUUID } from 'node:crypto';
import { buildAppConfig, buildPinoConfig } from '#src/config/index.js';
import { registerPlugins } from '#src/plugins/index.js';
import { registerRoutes } from '#src/modules/index.js';

export function buildApp({ storage, ai, audio, mailer } = {}) {
  const appConfig = buildAppConfig();

  const fastify = Fastify({
    logger: buildPinoConfig({ appConfig }),
    genReqId: () => randomUUID(),
    bodyLimit: 1024 * 1024,
  });

  registerPlugins({ fastify, appConfig, storage, ai, audio, mailer });
  fastify.register(registerRoutes);

  return fastify;
}
