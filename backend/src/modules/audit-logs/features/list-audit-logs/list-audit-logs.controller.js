import { listAuditLogsService } from '#src/modules/audit-logs/features/list-audit-logs/list-audit-logs.service.js';

export async function listAuditLogsController(request, reply) {
  const { auditLogs, meta } = await listAuditLogsService({
    query: request.query,
  });

  return reply.success({ data: { auditLogs }, meta });
}
