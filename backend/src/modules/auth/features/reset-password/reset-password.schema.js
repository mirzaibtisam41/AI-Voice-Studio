import { AUTH_TOKEN_MAX_LENGTH } from '#src/modules/auth/auth.constants.js';
import { newPasswordSchema } from '#src/modules/auth/shared/schemas/index.js';

export const resetPasswordSchema = {
  body: {
    type: 'object',
    required: ['token', 'password'],
    properties: {
      token: { type: 'string', minLength: 1, maxLength: AUTH_TOKEN_MAX_LENGTH },
      password: newPasswordSchema,
    },
    additionalProperties: false,
  },
};
