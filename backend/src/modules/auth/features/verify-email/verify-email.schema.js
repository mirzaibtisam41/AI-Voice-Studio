import { AUTH_TOKEN_MAX_LENGTH } from '#src/modules/auth/auth.constants.js';

export const verifyEmailSchema = {
  body: {
    type: 'object',
    required: ['token'],
    properties: {
      token: { type: 'string', minLength: 1, maxLength: AUTH_TOKEN_MAX_LENGTH },
    },
    additionalProperties: false,
  },
};
