import {
  AUDIT_ACTIONS,
  AUDIT_TARGET_TYPES,
} from '#src/modules/audit-logs/audit-log.constants.js';
import {
  OBJECT_ID_PATTERN,
  paginationQuerySchema,
} from '#src/shared/schemas/index.js';

export const listAuditLogsSchema = {
  querystring: {
    type: 'object',
    properties: {
      ...paginationQuerySchema.properties,
      search: { type: 'string', maxLength: 200 },
      action: { type: 'string', enum: AUDIT_ACTIONS },
      targetType: { type: 'string', enum: AUDIT_TARGET_TYPES },
      actorId: { type: 'string', pattern: OBJECT_ID_PATTERN },
      from: { type: 'string', format: 'date' },
      to: { type: 'string', format: 'date' },
    },
    additionalProperties: false,
  },
};
