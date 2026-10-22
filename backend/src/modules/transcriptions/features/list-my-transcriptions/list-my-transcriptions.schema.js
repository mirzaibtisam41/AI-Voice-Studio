import {
  OBJECT_ID_PATTERN,
  paginationQuerySchema,
} from '#src/shared/schemas/index.js';
import { TRANSCRIPTION_SEARCH_MAX_LENGTH } from '#src/modules/transcriptions/transcription.constants.js';

export const listMyTranscriptionsSchema = {
  querystring: {
    type: 'object',
    properties: {
      ...paginationQuerySchema.properties,
      audioFileId: { type: 'string', pattern: OBJECT_ID_PATTERN },
      search: { type: 'string', maxLength: TRANSCRIPTION_SEARCH_MAX_LENGTH },
    },
    additionalProperties: false,
  },
};
