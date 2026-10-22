import { objectIdParamsSchema } from '#src/shared/schemas/index.js';

export const getMyRealtimeSessionSchema = {
  params: objectIdParamsSchema('id'),
};
