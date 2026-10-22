import {
  USER_EMAIL_MAX_LENGTH,
  USER_NAME_MAX_LENGTH,
} from '#src/modules/users/user.constants.js';
import { newPasswordSchema } from '#src/modules/auth/shared/schemas/index.js';

export const registerSchema = {
  body: {
    type: 'object',
    required: ['name', 'email', 'password'],
    properties: {
      name: {
        type: 'string',
        minLength: 1,
        maxLength: USER_NAME_MAX_LENGTH,
        pattern: '\\S',
      },
      email: {
        type: 'string',
        format: 'email',
        maxLength: USER_EMAIL_MAX_LENGTH,
      },
      password: newPasswordSchema,
    },
    additionalProperties: false,
  },
};
