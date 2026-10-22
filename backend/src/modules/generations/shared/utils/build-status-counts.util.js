import { GENERATION_STATUSES } from '#src/modules/generations/generation.constants.js';

export function buildStatusCountsUtil({ rows }) {
  const counts = Object.fromEntries(
    GENERATION_STATUSES.map((status) => [
      status,
      rows.find((row) => row.status === status)?.total ?? 0,
    ]),
  );

  return {
    all: Object.values(counts).reduce((sum, value) => sum + value, 0),
    ...counts,
  };
}
