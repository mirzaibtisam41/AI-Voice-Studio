import { escapeRegexUtil } from '#src/utils/index.js';
import { AuditLogModel } from '#src/modules/audit-logs/audit-log.model.js';

function buildFilter({ search, action, actorId, targetType, from, to }) {
  const filter = {};

  if (search) {
    const pattern = new RegExp(escapeRegexUtil({ text: search }), 'i');

    filter.$or = [
      { action: pattern },
      { targetLabel: pattern },
      { actorEmail: pattern },
    ];
  }

  if (action) filter.action = action;
  if (actorId) filter.actorId = actorId;
  if (targetType) filter.targetType = targetType;
  if (from || to) {
    filter.createdAt = {};
    if (from) filter.createdAt.$gte = from;
    if (to) filter.createdAt.$lt = to;
  }

  return filter;
}

export async function listAuditLogsRepository({ filters, skip, limit }) {
  const filter = buildFilter(filters);

  const [auditLogs, total] = await Promise.all([
    AuditLogModel.find(filter)
      .sort({ createdAt: -1, _id: -1 })
      .skip(skip)
      .limit(limit),
    AuditLogModel.countDocuments(filter),
  ]);

  return { auditLogs, total };
}
