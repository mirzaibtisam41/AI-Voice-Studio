import { paginationQuerySchema } from '#src/shared/schemas/index.js';
import {
  USER_EMAIL_MAX_LENGTH,
  USER_LIST_SORT,
  USER_LIST_SORTS,
  USER_ROLES,
  USER_STATUSES,
} from '#src/modules/users/user.constants.js';

export const listUsersSchema = {
  querystring: {
    type: 'object',
    properties: {
      ...paginationQuerySchema.properties,
      search: { type: 'string', maxLength: USER_EMAIL_MAX_LENGTH },
      role: { type: 'string', enum: USER_ROLES },
      status: { type: 'string', enum: USER_STATUSES },
      sort: {
        type: 'string',
        enum: USER_LIST_SORTS,
        default: USER_LIST_SORT.NEWEST,
      },
    },
    additionalProperties: false,
  },
};
