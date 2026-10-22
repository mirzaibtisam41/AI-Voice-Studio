export const AUTH_TOKEN_TYPE = {
  EMAIL_VERIFY: 'email_verify',
  PASSWORD_RESET: 'password_reset',
};

export const AUTH_TOKEN_TYPES = Object.values(AUTH_TOKEN_TYPE);

export const PASSWORD_RESET_TOKEN_TTL_MINUTES = 30;
export const EMAIL_VERIFY_TOKEN_TTL_HOURS = 24;
