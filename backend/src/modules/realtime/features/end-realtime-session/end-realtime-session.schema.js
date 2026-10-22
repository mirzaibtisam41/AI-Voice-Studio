import { objectIdParamsSchema } from '#src/shared/schemas/index.js';
import {
  TRANSCRIPT_LINE_MAX_LENGTH,
  TRANSCRIPT_LINE_ROLES,
  TRANSCRIPT_LINES_MAX,
} from '#src/modules/generations/generation.constants.js';

export const endRealtimeSessionSchema = {
  params: objectIdParamsSchema('id'),
  body: {
    type: 'object',
    properties: {
      transcript: {
        type: 'array',
        maxItems: TRANSCRIPT_LINES_MAX,
        items: {
          type: 'object',
          required: ['role', 'text'],
          properties: {
            role: { type: 'string', enum: TRANSCRIPT_LINE_ROLES },
            text: {
              type: 'string',
              minLength: 1,
              maxLength: TRANSCRIPT_LINE_MAX_LENGTH,
              pattern: '\\S',
            },
            at: { type: 'number', minimum: 0 },
          },
          additionalProperties: false,
        },
      },
    },
    additionalProperties: false,
  },
};
