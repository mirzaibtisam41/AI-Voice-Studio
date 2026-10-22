import {
  APIConnectionError,
  APIConnectionTimeoutError,
  APIError,
  AuthenticationError,
  PermissionDeniedError,
  RateLimitError,
} from 'openai';
import {
  OPENAI_QUOTA_ERROR_CODES,
  PROVIDER_ERROR_CATEGORY,
} from '#src/constants/index.js';

const SAFETY_ERROR_CODES = ['moderation_blocked', 'content_policy_violation'];

export function mapOpenAiErrorIntegration({ error }) {
  if (error instanceof APIConnectionTimeoutError) {
    return PROVIDER_ERROR_CATEGORY.TIMEOUT;
  }

  if (error instanceof APIConnectionError) {
    return PROVIDER_ERROR_CATEGORY.PROVIDER_UNAVAILABLE;
  }

  if (
    error instanceof AuthenticationError ||
    error instanceof PermissionDeniedError
  ) {
    return PROVIDER_ERROR_CATEGORY.PROVIDER_AUTH_FAILED;
  }

  if (
    OPENAI_QUOTA_ERROR_CODES.includes(error?.code) ||
    error?.type === 'insufficient_quota' ||
    error?.error?.type === 'insufficient_quota'
  ) {
    return PROVIDER_ERROR_CATEGORY.QUOTA_EXCEEDED;
  }

  if (error instanceof RateLimitError) {
    return PROVIDER_ERROR_CATEGORY.RATE_LIMITED;
  }

  if (!(error instanceof APIError)) {
    return PROVIDER_ERROR_CATEGORY.UNKNOWN;
  }

  if (SAFETY_ERROR_CODES.includes(error.code)) {
    return PROVIDER_ERROR_CATEGORY.SAFETY_REJECTED;
  }

  if (error.status >= 500) {
    return PROVIDER_ERROR_CATEGORY.PROVIDER_UNAVAILABLE;
  }

  if (error.status >= 400) {
    return PROVIDER_ERROR_CATEGORY.INVALID_REQUEST;
  }

  return PROVIDER_ERROR_CATEGORY.UNKNOWN;
}
