import {
  USAGE_DEFAULT_RANGE_DAYS,
  USAGE_RANGE_DAYS,
  USAGE_TIMEZONE_MAX_LENGTH,
} from '#src/modules/usage/usage.constants.js';

export const getMyUsageSchema = {
  querystring: {
    type: 'object',
    properties: {
      days: {
        type: 'integer',
        enum: USAGE_RANGE_DAYS,
        default: USAGE_DEFAULT_RANGE_DAYS,
      },
      timezone: {
        type: 'string',
        minLength: 1,
        maxLength: USAGE_TIMEZONE_MAX_LENGTH,
      },
    },
    additionalProperties: false,
  },
};
