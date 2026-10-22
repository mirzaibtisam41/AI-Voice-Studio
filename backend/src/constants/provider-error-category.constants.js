export const PROVIDER_ERROR_CATEGORY = {
  SAFETY_REJECTED: 'safety_rejected',
  INVALID_REQUEST: 'invalid_request',
  RATE_LIMITED: 'rate_limited',
  QUOTA_EXCEEDED: 'quota_exceeded',
  PROVIDER_AUTH_FAILED: 'provider_auth_failed',
  PROVIDER_UNAVAILABLE: 'provider_unavailable',
  TIMEOUT: 'timeout',
  UNKNOWN: 'unknown',
};

export const PROVIDER_ERROR_CATEGORIES = Object.values(PROVIDER_ERROR_CATEGORY);
