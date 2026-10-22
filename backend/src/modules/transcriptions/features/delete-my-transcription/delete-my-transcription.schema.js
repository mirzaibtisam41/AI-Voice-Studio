import { objectIdParamsSchema } from '#src/shared/schemas/index.js';

export const deleteMyTranscriptionSchema = {
  params: objectIdParamsSchema('id'),
};
