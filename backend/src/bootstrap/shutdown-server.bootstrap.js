export async function shutdownServer({ fastify, signal }) {
  fastify.log.info(`${signal} received, shutting down`);

  const forceExit = setTimeout(() => {
    fastify.log.error('Shutdown took too long, forcing exit');
    process.exit(1);
  }, 10000);

  forceExit.unref();

  try {
    await fastify.close();
    fastify.log.info('Server closed');
    process.exit(0);
  } catch (error) {
    fastify.log.error({ err: error }, 'Error during shutdown');
    process.exit(1);
  }
}
