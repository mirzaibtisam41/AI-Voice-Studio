import {
  BadRequestError,
  buildPaginationMetaUtil,
  buildPaginationUtil,
} from '#src/utils/index.js';
import { listAuditLogsRepository } from '#src/modules/audit-logs/shared/repositories/index.js';

const DAY_MILLISECONDS = 24 * 60 * 60 * 1000;

function buildDateRange({ from, to }) {
  const start = from ? new Date(`${from}T00:00:00.000Z`) : null;
  const end = to
    ? new Date(new Date(`${to}T00:00:00.000Z`).getTime() + DAY_MILLISECONDS)
    : null;

  if (start && end && start >= end) {
    throw new BadRequestError(
      'The start date must be on or before the end date',
    );
  }

  return { start, end };
}

export async function listAuditLogsService({ query }) {
  const { page, limit } = query;
  const { start, end } = buildDateRange({ from: query.from, to: query.to });

  const { auditLogs, total } = await listAuditLogsRepository({
    filters: {
      search: query.search?.trim(),
      action: query.action,
      actorId: query.actorId,
      targetType: query.targetType,
      from: start,
      to: end,
    },
    ...buildPaginationUtil({ page, limit }),
  });

  return { auditLogs, meta: buildPaginationMetaUtil({ page, limit, total }) };
}
