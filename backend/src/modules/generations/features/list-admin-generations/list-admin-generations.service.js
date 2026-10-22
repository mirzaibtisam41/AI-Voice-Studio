import mongoose from 'mongoose';
import {
  BadRequestError,
  buildPaginationMetaUtil,
  buildPaginationUtil,
  escapeRegexUtil,
} from '#src/utils/index.js';
import { listAdminGenerationsRepository } from '#src/modules/generations/shared/repositories/index.js';
import { presentGenerationSummaryUtil } from '#src/modules/generations/shared/utils/index.js';

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;
const DAY_MS = 24 * 60 * 60 * 1000;

function buildCreatedAtFilter({ from, to }) {
  const range = {};

  if (from) range.$gte = new Date(from);

  if (to) {
    if (DATE_ONLY.test(to)) {
      range.$lt = new Date(Date.parse(`${to}T00:00:00Z`) + DAY_MS);
    } else {
      range.$lte = new Date(to);
    }
  }

  if (range.$gte && range.$gte > (range.$lt ?? range.$lte ?? Infinity)) {
    throw new BadRequestError('The start date must be before the end date');
  }

  return Object.keys(range).length ? range : null;
}

function buildFilter(query) {
  const filter = {};

  if (query.status) filter.status = query.status;
  if (query.capability) filter.capability = query.capability;
  if (query.userId) filter.userId = new mongoose.Types.ObjectId(query.userId);

  const createdAt = buildCreatedAtFilter(query);

  if (createdAt) filter.createdAt = createdAt;

  return filter;
}

function presentUser(user) {
  if (!user) return null;

  return { id: String(user._id), name: user.name, email: user.email };
}

export async function listAdminGenerationsService({ query }) {
  const { page, limit } = query;
  const { skip } = buildPaginationUtil({ page, limit });
  const search = query.search?.trim();

  const { generations, total } = await listAdminGenerationsRepository({
    filter: buildFilter(query),
    emailPattern: search ? escapeRegexUtil({ text: search }) : null,
    skip,
    limit,
  });

  return {
    generations: generations.map((generation) => ({
      ...presentGenerationSummaryUtil({ generation }),
      userId: String(generation.userId),
      user: presentUser(generation.user),
      failedAt: generation.failedAt ?? null,
    })),
    meta: buildPaginationMetaUtil({ page, limit, total }),
  };
}
