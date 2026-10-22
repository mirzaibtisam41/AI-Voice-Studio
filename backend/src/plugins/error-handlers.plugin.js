import fp from 'fastify-plugin';
import { errorHandler, notFoundHandler } from '#src/handlers/index.js';

async function registerErrorHandlers(fastify) {
  fastify.setErrorHandler(errorHandler);
  fastify.setNotFoundHandler(notFoundHandler);
}

export const errorHandlersPlugin = fp(registerErrorHandlers);
