import { objectIdListSchema } from '#src/shared/schemas/index.js';

export const bulkDeleteMyAudioFilesSchema = {
  body: {
    type: 'object',
    required: ['ids'],
    properties: {
      ids: objectIdListSchema,
    },
    additionalProperties: false,
  },
};
