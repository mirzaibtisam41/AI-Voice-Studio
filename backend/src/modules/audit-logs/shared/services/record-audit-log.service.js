import { createAuditLogRepository } from '#src/modules/audit-logs/shared/repositories/index.js';

export function recordAuditLogService({
  session,
  actor,
  action,
  targetType,
  targetId = null,
  targetLabel = null,
  details = null,
}) {
  return createAuditLogRepository({
    session,
    data: {
      actorId: actor?._id ?? actor?.id ?? null,
      actorEmail: actor?.email ?? 'system',
      action,
      targetType,
      targetId: targetId ? String(targetId) : null,
      targetLabel,
      details,
    },
  });
}
