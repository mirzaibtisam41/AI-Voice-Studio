import { USER_EMAIL_MAX_LENGTH } from '#src/modules/users/user.constants.js';
import { currentPasswordSchema } from '#src/modules/auth/shared/schemas/index.js';

export const loginSchema = {
  body: {
    type: 'object',
    required: ['email', 'password'],
    properties: {
      email: {
        type: 'string',
        format: 'email',
        maxLength: USER_EMAIL_MAX_LENGTH,
      },
      password: currentPasswordSchema,
    },
    additionalProperties: false,
  },
};
