export const CREDIT_TRANSACTION_TYPE = {
  SIGNUP_GRANT: 'signup_grant',
  ADMIN_CREDIT: 'admin_credit',
  ADMIN_DEBIT: 'admin_debit',
  USAGE_HOLD: 'usage_hold',
  USAGE_REFUND: 'usage_refund',
};

export const CREDIT_TRANSACTION_TYPES = Object.values(CREDIT_TRANSACTION_TYPE);

export const CREDIT_TRANSACTION_REASON_MAX_LENGTH = 300;
export const CREDIT_IDEMPOTENCY_KEY_MAX_LENGTH = 200;
