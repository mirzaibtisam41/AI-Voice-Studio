import fp from 'fastify-plugin';
import fastifyMultipart from '@fastify/multipart';

export const MULTIPART_MAX_FILE_BYTES = 25 * 1024 * 1024;

async function registerMultipart(fastify) {
  await fastify.register(fastifyMultipart, {
    limits: {
      fileSize: MULTIPART_MAX_FILE_BYTES,
      files: 1,
      fields: 10,
    },
  });
}

export const multipartPlugin = fp(registerMultipart);
