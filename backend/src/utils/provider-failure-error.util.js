import { PROVIDER_ERROR_CATEGORY } from '#src/constants/index.js';
import {
  BadRequestError,
  ServiceUnavailableError,
} from '#src/utils/http-errors.util.js';

export function buildProviderFailureErrorUtil({ category, refundedCredits }) {
  const refund =
    refundedCredits > 0
      ? ` Your ${refundedCredits} credits were refunded.`
      : '';

  if (category === PROVIDER_ERROR_CATEGORY.SAFETY_REJECTED) {
    return new BadRequestError(
      `The safety filter blocked this request. Try different wording.${refund}`,
    );
  }

  if (category === PROVIDER_ERROR_CATEGORY.INVALID_REQUEST) {
    return new BadRequestError(
      `The AI provider could not process this request.${refund}`,
    );
  }

  if (category === PROVIDER_ERROR_CATEGORY.RATE_LIMITED) {
    return new ServiceUnavailableError(
      `The AI provider is busy right now, please try again in a minute.${refund}`,
    );
  }

  if (category === PROVIDER_ERROR_CATEGORY.TIMEOUT) {
    return new ServiceUnavailableError(
      `The AI provider took too long to answer.${refund}`,
    );
  }

  return new ServiceUnavailableError(
    `This AI feature is not available right now, please try again later.${refund}`,
  );
}

export const PROVIDER_CATEGORIES_THAT_NEED_AN_ADMIN = [
  PROVIDER_ERROR_CATEGORY.QUOTA_EXCEEDED,
  PROVIDER_ERROR_CATEGORY.PROVIDER_AUTH_FAILED,
  PROVIDER_ERROR_CATEGORY.UNKNOWN,
];
