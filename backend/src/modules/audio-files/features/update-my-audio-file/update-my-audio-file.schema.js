import { AUDIO_FILE_TITLE_MAX_LENGTH } from '#src/modules/audio-files/audio-file.constants.js';
import { objectIdParamsSchema } from '#src/shared/schemas/index.js';

export const updateMyAudioFileSchema = {
  params: objectIdParamsSchema('id'),
  body: {
    type: 'object',
    minProperties: 1,
    properties: {
      title: {
        type: 'string',
        minLength: 1,
        maxLength: AUDIO_FILE_TITLE_MAX_LENGTH,
        pattern: '\\S',
      },
      favorite: { type: 'boolean' },
    },
    additionalProperties: false,
  },
};
