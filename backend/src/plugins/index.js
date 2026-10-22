import { aiPlugin } from '#src/plugins/ai.plugin.js';
import { audioPlugin } from '#src/plugins/audio.plugin.js';
import { configPlugin } from '#src/plugins/config.plugin.js';
import { cookiePlugin } from '#src/plugins/cookie.plugin.js';
import { corsPlugin } from '#src/plugins/cors.plugin.js';
import { databasePlugin } from '#src/plugins/database.plugin.js';
import { errorHandlersPlugin } from '#src/plugins/error-handlers.plugin.js';
import { helmetPlugin } from '#src/plugins/helmet.plugin.js';
import { jwtPlugin } from '#src/plugins/jwt.plugin.js';
import { mailerPlugin } from '#src/plugins/mailer.plugin.js';
import { multipartPlugin } from '#src/plugins/multipart.plugin.js';
import { rateLimitPlugin } from '#src/plugins/rate-limit.plugin.js';
import { replySuccessPlugin } from '#src/plugins/reply-success.plugin.js';
import { storagePlugin } from '#src/plugins/storage.plugin.js';

export function registerPlugins({
  fastify,
  appConfig,
  storage,
  ai,
  audio,
  mailer,
}) {
  fastify.register(configPlugin, { appConfig });
  fastify.register(databasePlugin);
  fastify.register(storagePlugin, { storage });
  fastify.register(aiPlugin, { ai });
  fastify.register(audioPlugin, { audio });
  fastify.register(mailerPlugin, { mailer });
  fastify.register(helmetPlugin);
  fastify.register(corsPlugin);
  fastify.register(rateLimitPlugin);
  fastify.register(cookiePlugin);
  fastify.register(jwtPlugin);
  fastify.register(multipartPlugin);
  fastify.register(errorHandlersPlugin);
  fastify.register(replySuccessPlugin);
}
