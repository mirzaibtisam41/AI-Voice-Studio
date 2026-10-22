import { objectIdListSchema } from '#src/shared/schemas/index.js';

export const bulkFavoriteMyAudioFilesSchema = {
  body: {
    type: 'object',
    required: ['ids', 'favorite'],
    properties: {
      ids: objectIdListSchema,
      favorite: { type: 'boolean' },
    },
    additionalProperties: false,
  },
};
