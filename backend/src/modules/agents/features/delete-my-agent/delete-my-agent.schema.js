import { objectIdParamsSchema } from '#src/shared/schemas/index.js';

export const deleteMyAgentSchema = {
  params: objectIdParamsSchema('id'),
};
