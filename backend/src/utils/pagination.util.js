export function buildPaginationUtil({ page, limit }) {
  return { skip: (page - 1) * limit, limit };
}

export function buildPaginationMetaUtil({ page, limit, total }) {
  return { page, limit, total, totalPages: Math.ceil(total / limit) };
}
