import { objectIdParamsSchema } from '#src/shared/schemas/index.js';

export const getMyTranscriptionSchema = {
  params: objectIdParamsSchema('id'),
};
