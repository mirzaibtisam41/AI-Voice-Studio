import { USER_NAME_MAX_LENGTH } from '#src/modules/users/user.constants.js';

export const updateMyProfileSchema = {
  body: {
    type: 'object',
    required: ['name'],
    properties: {
      name: {
        type: 'string',
        minLength: 1,
        maxLength: USER_NAME_MAX_LENGTH,
        pattern: '\\S',
      },
    },
    additionalProperties: false,
  },
};
