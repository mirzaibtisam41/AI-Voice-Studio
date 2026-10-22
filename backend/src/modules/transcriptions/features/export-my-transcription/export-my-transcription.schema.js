import { objectIdParamsSchema } from '#src/shared/schemas/index.js';
import {
  TRANSCRIPT_EXPORT_FORMAT,
  TRANSCRIPT_EXPORT_FORMATS,
} from '#src/modules/transcriptions/transcription.constants.js';

export const exportMyTranscriptionSchema = {
  params: objectIdParamsSchema('id'),
  querystring: {
    type: 'object',
    properties: {
      format: {
        type: 'string',
        enum: TRANSCRIPT_EXPORT_FORMATS,
        default: TRANSCRIPT_EXPORT_FORMAT.TXT,
      },
    },
    additionalProperties: false,
  },
};
