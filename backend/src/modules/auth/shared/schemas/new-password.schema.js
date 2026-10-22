import {
  USER_PASSWORD_MAX_LENGTH,
  USER_PASSWORD_MIN_LENGTH,
} from '#src/modules/users/user.constants.js';
import { PASSWORD_PATTERN } from '#src/modules/auth/auth.constants.js';

export const newPasswordSchema = {
  type: 'string',
  minLength: USER_PASSWORD_MIN_LENGTH,
  maxLength: USER_PASSWORD_MAX_LENGTH,
  pattern: PASSWORD_PATTERN,
};

export const currentPasswordSchema = {
  type: 'string',
  minLength: 1,
  maxLength: USER_PASSWORD_MAX_LENGTH,
};
