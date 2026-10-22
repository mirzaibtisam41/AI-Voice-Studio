import {
  VOICE_ACCENT_MAX_LENGTH,
  VOICE_DESCRIPTION_MAX_LENGTH,
  VOICE_GENDERS,
  VOICE_NAME_MAX_LENGTH,
  VOICE_TAG_MAX_LENGTH,
  VOICE_TAGS_MAX,
} from '#src/modules/voices/voice.constants.js';
import { objectIdParamsSchema } from '#src/shared/schemas/index.js';

export const updateVoiceSchema = {
  params: objectIdParamsSchema('id'),
  body: {
    type: 'object',
    minProperties: 1,
    properties: {
      name: {
        type: 'string',
        minLength: 1,
        maxLength: VOICE_NAME_MAX_LENGTH,
        pattern: '\\S',
      },
      accent: {
        type: 'string',
        minLength: 1,
        maxLength: VOICE_ACCENT_MAX_LENGTH,
        pattern: '\\S',
      },
      gender: { type: 'string', enum: VOICE_GENDERS },
      tags: {
        type: 'array',
        maxItems: VOICE_TAGS_MAX,
        items: {
          type: 'string',
          minLength: 1,
          maxLength: VOICE_TAG_MAX_LENGTH,
          pattern: '\\S',
        },
      },
      description: {
        type: ['string', 'null'],
        maxLength: VOICE_DESCRIPTION_MAX_LENGTH,
      },
      enabled: { type: 'boolean' },
      sortOrder: { type: 'integer', minimum: 0, maximum: 10000 },
    },
    additionalProperties: false,
  },
};
