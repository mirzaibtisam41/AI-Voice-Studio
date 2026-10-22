import {
  buildPaginationMetaUtil,
  buildPaginationUtil,
} from '#src/utils/index.js';
import {
  countUserAgentsRepository,
  listUserAgentsRepository,
} from '#src/modules/agents/shared/repositories/index.js';

export async function listMyAgentsService({ userId, query }) {
  const { page, limit, status } = query;
  const { skip } = buildPaginationUtil({ page, limit });

  const [agents, total] = await Promise.all([
    listUserAgentsRepository({ userId, status, skip, limit }),
    countUserAgentsRepository({ userId, status }),
  ]);

  return { agents, meta: buildPaginationMetaUtil({ page, limit, total }) };
}
