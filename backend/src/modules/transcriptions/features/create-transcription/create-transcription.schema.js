import { OBJECT_ID_PATTERN } from '#src/shared/schemas/index.js';
import {
  TRANSCRIPTION_KEYWORD_MAX_LENGTH,
  TRANSCRIPTION_KEYWORD_PATTERN,
  TRANSCRIPTION_KEYWORDS_MAX,
  TRANSCRIPTION_LANGUAGE_CODES,
  TRANSCRIPTION_LANGUAGES_MAX,
} from '#src/modules/transcriptions/transcription.constants.js';

export const createTranscriptionSchema = {
  body: {
    type: 'object',
    required: ['audioFileId'],
    properties: {
      audioFileId: { type: 'string', pattern: OBJECT_ID_PATTERN },
      modelId: { type: 'string', pattern: OBJECT_ID_PATTERN },
      languages: {
        type: 'array',
        maxItems: TRANSCRIPTION_LANGUAGES_MAX,
        uniqueItems: true,
        items: { type: 'string', enum: TRANSCRIPTION_LANGUAGE_CODES },
      },
      keywords: {
        type: 'array',
        maxItems: TRANSCRIPTION_KEYWORDS_MAX,
        items: {
          type: 'string',
          minLength: 1,
          maxLength: TRANSCRIPTION_KEYWORD_MAX_LENGTH,
          pattern: TRANSCRIPTION_KEYWORD_PATTERN,
        },
      },
    },
    additionalProperties: false,
  },
};
