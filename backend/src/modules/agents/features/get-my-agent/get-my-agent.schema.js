import { objectIdParamsSchema } from '#src/shared/schemas/index.js';

export const getMyAgentSchema = {
  params: objectIdParamsSchema('id'),
};
