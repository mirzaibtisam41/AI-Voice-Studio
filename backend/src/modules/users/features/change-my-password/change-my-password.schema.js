import {
  currentPasswordSchema,
  newPasswordSchema,
} from '#src/modules/auth/shared/schemas/index.js';

export const changeMyPasswordSchema = {
  body: {
    type: 'object',
    required: ['currentPassword', 'newPassword'],
    properties: {
      currentPassword: currentPasswordSchema,
      newPassword: newPasswordSchema,
    },
    additionalProperties: false,
  },
};
