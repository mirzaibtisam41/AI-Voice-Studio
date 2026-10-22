import { objectIdParamsSchema } from '#src/shared/schemas/index.js';
import { TRANSCRIPT_TEXT_MAX_LENGTH } from '#src/modules/generations/generation.constants.js';

export const updateMyTranscriptionSchema = {
  params: objectIdParamsSchema('id'),
  body: {
    type: 'object',
    required: ['text'],
    properties: {
      text: {
        type: 'string',
        minLength: 1,
        maxLength: TRANSCRIPT_TEXT_MAX_LENGTH,
        pattern: '\\S',
      },
    },
    additionalProperties: false,
  },
};
