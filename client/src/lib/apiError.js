const DEFAULT_MESSAGE = 'Something went wrong. Please try again.';
const INVALID_VALUE_MESSAGE = 'This value is not valid.';

const STATUS_MESSAGES = {
  401: 'Your session has ended. Please sign in again.',
  403: 'You do not have permission to do this.',
  404: 'We could not find what you were looking for.',
  429: 'Too many attempts. Please wait a moment and try again.',
};

export function getErrorMessage(error) {
  if (!error) return '';
  if (error.status === 'FETCH_ERROR') {
    return 'Could not reach the server. Check your connection and try again.';
  }
  if (error.status === 'TIMEOUT_ERROR') return 'The request timed out.';
  if (error.status === 'PARSING_ERROR') return DEFAULT_MESSAGE;
  if (error.data?.message) return error.data.message;
  if (STATUS_MESSAGES[error.status]) return STATUS_MESSAGES[error.status];

  return DEFAULT_MESSAGE;
}

export function readFieldErrors(error) {
  const details = error?.data?.details;

  if (!Array.isArray(details)) return {};

  const fieldErrors = {};

  for (const detail of details) {
    const field = detail.instancePath
      ? detail.instancePath.split('/')[1]
      : detail.params?.missingProperty;

    if (field && !fieldErrors[field]) {
      fieldErrors[field] = INVALID_VALUE_MESSAGE;
    }
  }

  return fieldErrors;
}
