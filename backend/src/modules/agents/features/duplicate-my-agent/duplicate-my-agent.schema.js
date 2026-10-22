import { objectIdParamsSchema } from '#src/shared/schemas/index.js';

export const duplicateMyAgentSchema = {
  params: objectIdParamsSchema('id'),
};
