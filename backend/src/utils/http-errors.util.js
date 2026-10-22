import createError from '@fastify/error';
import { StatusCodes } from 'http-status-codes';
import { ERROR_CODE } from '#src/constants/index.js';

export const BadRequestError = createError(
  ERROR_CODE.BAD_REQUEST,
  '%s',
  StatusCodes.BAD_REQUEST,
);

export const UnauthorizedError = createError(
  ERROR_CODE.UNAUTHORIZED,
  '%s',
  StatusCodes.UNAUTHORIZED,
);

export const ForbiddenError = createError(
  ERROR_CODE.FORBIDDEN,
  '%s',
  StatusCodes.FORBIDDEN,
);

export const NotFoundError = createError(
  ERROR_CODE.NOT_FOUND,
  '%s',
  StatusCodes.NOT_FOUND,
);

export const ConflictError = createError(
  ERROR_CODE.CONFLICT,
  '%s',
  StatusCodes.CONFLICT,
);

export const PayloadTooLargeError = createError(
  ERROR_CODE.PAYLOAD_TOO_LARGE,
  '%s',
  StatusCodes.REQUEST_TOO_LONG,
);

export const TooManyRequestsError = createError(
  ERROR_CODE.TOO_MANY_REQUESTS,
  '%s',
  StatusCodes.TOO_MANY_REQUESTS,
);

export const ServiceUnavailableError = createError(
  ERROR_CODE.SERVICE_UNAVAILABLE,
  '%s',
  StatusCodes.SERVICE_UNAVAILABLE,
);

export const UnsupportedMediaTypeError = createError(
  ERROR_CODE.UNSUPPORTED_MEDIA_TYPE,
  '%s',
  StatusCodes.UNSUPPORTED_MEDIA_TYPE,
);

export const InsufficientCreditsError = createError(
  ERROR_CODE.INSUFFICIENT_CREDITS,
  '%s',
  StatusCodes.PAYMENT_REQUIRED,
);
