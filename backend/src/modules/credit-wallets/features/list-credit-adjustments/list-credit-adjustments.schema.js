import { paginationQuerySchema } from '#src/shared/schemas/index.js';

export const listCreditAdjustmentsSchema = {
  querystring: paginationQuerySchema,
};
