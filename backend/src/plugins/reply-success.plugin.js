import fp from 'fastify-plugin';
import { StatusCodes } from 'http-status-codes';

function replySuccess({
  data = null,
  message = 'Success',
  statusCode = StatusCodes.OK,
  meta,
} = {}) {
  const body = { success: true, statusCode, message, data };

  if (meta) body.meta = meta;

  return this.code(statusCode).send(body);
}

async function registerReplySuccess(fastify) {
  fastify.decorateReply('success', replySuccess);
}

export const replySuccessPlugin = fp(registerReplySuccess);
