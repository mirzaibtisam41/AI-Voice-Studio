import {
  buildPaginationMetaUtil,
  buildPaginationUtil,
  escapeRegexUtil,
} from '#src/utils/index.js';
import { listUsersRepository } from '#src/modules/users/shared/repositories/index.js';

function buildFilter({ search, role, status }) {
  const filter = {};
  const text = search?.trim();

  if (text) {
    const pattern = new RegExp(escapeRegexUtil({ text }), 'i');

    filter.$or = [{ name: pattern }, { email: pattern }];
  }

  if (role) filter.role = role;
  if (status) filter.status = status;

  return filter;
}

function toListedUser({ _id, ...user }) {
  return { id: _id.toString(), ...user };
}

export async function listUsersService({ query }) {
  const { page, limit, sort } = query;
  const pagination = buildPaginationUtil({ page, limit });

  const { users, total } = await listUsersRepository({
    filter: buildFilter(query),
    sort,
    skip: pagination.skip,
    limit: pagination.limit,
  });

  return {
    users: users.map(toListedUser),
    meta: buildPaginationMetaUtil({ page, limit, total }),
  };
}
