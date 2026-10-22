import {
  AUDIO_FILE_KINDS,
  AUDIO_FILE_SEARCH_MAX_LENGTH,
  AUDIO_FILE_SORT,
  AUDIO_FILE_SORTS,
} from '#src/modules/audio-files/audio-file.constants.js';
import { paginationQuerySchema } from '#src/shared/schemas/index.js';

export const listMyAudioFilesSchema = {
  querystring: {
    type: 'object',
    properties: {
      ...paginationQuerySchema.properties,
      kind: { type: 'string', enum: AUDIO_FILE_KINDS },
      transcribed: { type: 'boolean' },
      favorite: { type: 'boolean' },
      search: { type: 'string', maxLength: AUDIO_FILE_SEARCH_MAX_LENGTH },
      sort: {
        type: 'string',
        enum: AUDIO_FILE_SORTS,
        default: AUDIO_FILE_SORT.NEWEST,
      },
    },
    additionalProperties: false,
  },
};
