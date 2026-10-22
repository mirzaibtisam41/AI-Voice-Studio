import { shutdownServer } from '#src/bootstrap/shutdown-server.bootstrap.js';
import { buildApp } from '#src/bootstrap/build-app.bootstrap.js';
import { startJobs } from '#src/bootstrap/start-jobs.bootstrap.js';

export async function startServer() {
  const fastify = buildApp();

  try {
    await fastify.ready();

    await fastify.listen({
      port: fastify.config.PORT,
      host: '0.0.0.0',
    });

    startJobs({ fastify });

    for (const signal of ['SIGINT', 'SIGTERM']) {
      process.once(signal, () => shutdownServer({ fastify, signal }));
    }
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}
