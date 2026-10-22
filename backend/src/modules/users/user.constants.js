export const USER_ROLE = {
  USER: 'user',
  ADMIN: 'admin',
};

export const USER_ROLES = Object.values(USER_ROLE);

export const USER_STATUS = {
  ACTIVE: 'active',
  SUSPENDED: 'suspended',
  DEACTIVATED: 'deactivated',
};

export const USER_STATUSES = Object.values(USER_STATUS);

export const USER_LIST_SORT = {
  NEWEST: 'newest',
  OLDEST: 'oldest',
  BALANCE: 'balance',
};

export const USER_LIST_SORTS = Object.values(USER_LIST_SORT);

export const USER_NAME_MAX_LENGTH = 150;
export const USER_EMAIL_MAX_LENGTH = 255;
export const USER_PASSWORD_MIN_LENGTH = 8;
export const USER_PASSWORD_MAX_LENGTH = 128;
