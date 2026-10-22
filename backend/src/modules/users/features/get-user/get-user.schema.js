import { objectIdParamsSchema } from '#src/shared/schemas/index.js';

export const getUserSchema = {
  params: objectIdParamsSchema('userId'),
};
