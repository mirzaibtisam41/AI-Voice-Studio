import { currentPasswordSchema } from '#src/modules/auth/shared/schemas/index.js';

export const deactivateMyAccountSchema = {
  body: {
    type: 'object',
    required: ['password'],
    properties: {
      password: currentPasswordSchema,
    },
    additionalProperties: false,
  },
};
