import {
  checkUserIsAdminHook,
  checkUserIsLoggedInHook,
} from '#src/hooks/index.js';
import { listAuditLogsController } from '#src/modules/audit-logs/features/list-audit-logs/list-audit-logs.controller.js';
import { listAuditLogsSchema } from '#src/modules/audit-logs/features/list-audit-logs/list-audit-logs.schema.js';

export async function auditLogsRoutes(fastify) {
  fastify.addHook('onRequest', checkUserIsLoggedInHook);
  fastify.addHook('onRequest', checkUserIsAdminHook);

  fastify.get('/', { schema: listAuditLogsSchema }, listAuditLogsController);
}
