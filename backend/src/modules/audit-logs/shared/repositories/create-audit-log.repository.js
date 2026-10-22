import { AuditLogModel } from '#src/modules/audit-logs/audit-log.model.js';

export async function createAuditLogRepository({ session, data }) {
  const [auditLog] = await AuditLogModel.create([data], { session });

  return auditLog;
}
