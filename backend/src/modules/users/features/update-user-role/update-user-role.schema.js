import { objectIdParamsSchema } from '#src/shared/schemas/index.js';
import { USER_ROLES } from '#src/modules/users/user.constants.js';

export const updateUserRoleSchema = {
  params: objectIdParamsSchema('userId'),
  body: {
    type: 'object',
    required: ['role'],
    properties: {
      role: { type: 'string', enum: USER_ROLES },
    },
    additionalProperties: false,
  },
};
