import { StatusCodes } from 'http-status-codes';
import { ERROR_CODE, ERROR_CODES } from '#src/constants/index.js';

function resolveError(error) {
  if (error.validation) {
    return {
      statusCode: StatusCodes.BAD_REQUEST,
      code: ERROR_CODE.VALIDATION_ERROR,
      message: 'Request validation failed',
      details: error.validation,
    };
  }

  if (ERROR_CODES.includes(error.code)) {
    return {
      statusCode: error.statusCode,
      code: error.code,
      message: error.message,
    };
  }

  if (error.statusCode >= 400 && error.statusCode < 500) {
    return {
      statusCode: error.statusCode,
      code: ERROR_CODE.BAD_REQUEST,
      message: error.message,
    };
  }

  return {
    statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
    code: ERROR_CODE.INTERNAL_SERVER_ERROR,
    message: 'Something went wrong',
  };
}

export function errorHandler(error, request, reply) {
  const response = resolveError(error);

  if (response.statusCode >= StatusCodes.INTERNAL_SERVER_ERROR) {
    request.log.error({ err: error }, 'Unhandled error');
  }

  return reply.code(response.statusCode).send({ success: false, ...response });
}
