import {
  OPENAI_QUOTA_ERROR_CODES,
  PROVIDER_ERROR_CATEGORY,
} from '#src/constants/index.js';

const NETWORK_ERROR_CODES = [
  'ECONNREFUSED',
  'ECONNRESET',
  'ENOTFOUND',
  'EAI_AGAIN',
  'ETIMEDOUT',
  'EHOSTUNREACH',
  'ENETUNREACH',
];

const SAFETY_ERROR_CODES = ['moderation_blocked', 'content_policy_violation'];

function mapHttpStatus(status) {
  if (status === 401 || status === 403) {
    return PROVIDER_ERROR_CATEGORY.PROVIDER_AUTH_FAILED;
  }

  if (status === 429) return PROVIDER_ERROR_CATEGORY.RATE_LIMITED;
  if (status === 408) return PROVIDER_ERROR_CATEGORY.TIMEOUT;
  if (status >= 500) return PROVIDER_ERROR_CATEGORY.PROVIDER_UNAVAILABLE;
  if (status >= 400) return PROVIDER_ERROR_CATEGORY.INVALID_REQUEST;

  return PROVIDER_ERROR_CATEGORY.UNKNOWN;
}

function mapErrorDetails({ code, type }) {
  if (
    OPENAI_QUOTA_ERROR_CODES.includes(code) ||
    type === 'insufficient_quota'
  ) {
    return PROVIDER_ERROR_CATEGORY.QUOTA_EXCEEDED;
  }

  if (code === 'rate_limit_exceeded' || type === 'rate_limit_error') {
    return PROVIDER_ERROR_CATEGORY.RATE_LIMITED;
  }

  if (
    code === 'invalid_api_key' ||
    type === 'authentication_error' ||
    type === 'permission_error'
  ) {
    return PROVIDER_ERROR_CATEGORY.PROVIDER_AUTH_FAILED;
  }

  if (SAFETY_ERROR_CODES.includes(code)) {
    return PROVIDER_ERROR_CATEGORY.SAFETY_REJECTED;
  }

  if (type === 'invalid_request_error') {
    return PROVIDER_ERROR_CATEGORY.INVALID_REQUEST;
  }

  if (type === 'server_error') {
    return PROVIDER_ERROR_CATEGORY.PROVIDER_UNAVAILABLE;
  }

  return null;
}

function readDetailsFromMessage(message) {
  const code = String(message ?? '').match(/\bcode=([\w.-]+)/)?.[1];
  const type = String(message ?? '').match(/\btype=([\w.-]+)/)?.[1];

  if (!code && !type) return null;

  return {
    code: code === 'null' ? null : code,
    type: type === 'null' ? null : type,
  };
}

export function mapRealtimeErrorIntegration({ error }) {
  const details = error?.error ?? readDetailsFromMessage(error?.message);

  if (details) {
    return mapErrorDetails(details) ?? PROVIDER_ERROR_CATEGORY.UNKNOWN;
  }

  const status = String(error?.message ?? '').match(
    /Unexpected server response: (\d{3})/,
  );

  if (status) return mapHttpStatus(Number(status[1]));

  const networkCode = error?.cause?.code ?? error?.code;

  if (NETWORK_ERROR_CODES.includes(networkCode)) {
    return PROVIDER_ERROR_CATEGORY.PROVIDER_UNAVAILABLE;
  }

  return PROVIDER_ERROR_CATEGORY.UNKNOWN;
}

export function mapRealtimeResponseStatusIntegration({ response }) {
  const statusDetails = response?.status_details;

  if (response?.status === 'incomplete') {
    return statusDetails?.reason === 'content_filter'
      ? PROVIDER_ERROR_CATEGORY.SAFETY_REJECTED
      : PROVIDER_ERROR_CATEGORY.INVALID_REQUEST;
  }

  if (response?.status === 'failed' && statusDetails?.error) {
    return (
      mapErrorDetails(statusDetails.error) ?? PROVIDER_ERROR_CATEGORY.UNKNOWN
    );
  }

  return PROVIDER_ERROR_CATEGORY.UNKNOWN;
}
