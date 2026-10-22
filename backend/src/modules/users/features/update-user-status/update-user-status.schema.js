import { objectIdParamsSchema } from '#src/shared/schemas/index.js';
import { USER_STATUS } from '#src/modules/users/user.constants.js';

export const updateUserStatusSchema = {
  params: objectIdParamsSchema('userId'),
  body: {
    type: 'object',
    required: ['status'],
    properties: {
      status: {
        type: 'string',
        enum: [USER_STATUS.ACTIVE, USER_STATUS.SUSPENDED],
      },
    },
    additionalProperties: false,
  },
};
