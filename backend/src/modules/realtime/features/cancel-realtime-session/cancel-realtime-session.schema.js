import { objectIdParamsSchema } from '#src/shared/schemas/index.js';

export const cancelRealtimeSessionSchema = {
  params: objectIdParamsSchema('id'),
};
