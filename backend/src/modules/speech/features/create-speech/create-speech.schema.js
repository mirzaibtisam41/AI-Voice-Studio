import {
  AUDIO_FILE_TITLE_MAX_LENGTH,
  AUDIO_FORMATS,
} from '#src/modules/audio-files/audio-file.constants.js';
import { OBJECT_ID_PATTERN } from '#src/shared/schemas/index.js';
import {
  SPEECH_DIRECTION_MAX_LENGTH,
  SPEECH_SPEED,
  SPEECH_STYLES,
  SPEECH_TEXT_MAX_LENGTH,
  SPEECH_VOICE_CODE_MAX_LENGTH,
} from '#src/modules/speech/speech.constants.js';

export const createSpeechSchema = {
  body: {
    type: 'object',
    required: ['text', 'voiceCode'],
    properties: {
      text: {
        type: 'string',
        minLength: 1,
        maxLength: SPEECH_TEXT_MAX_LENGTH,
        pattern: '\\S',
      },
      voiceCode: {
        type: 'string',
        minLength: 1,
        maxLength: SPEECH_VOICE_CODE_MAX_LENGTH,
      },
      modelId: { type: 'string', pattern: OBJECT_ID_PATTERN },
      format: { type: 'string', enum: AUDIO_FORMATS },
      style: { type: 'string', enum: SPEECH_STYLES },
      direction: { type: 'string', maxLength: SPEECH_DIRECTION_MAX_LENGTH },
      speed: {
        type: 'number',
        minimum: SPEECH_SPEED.MIN,
        maximum: SPEECH_SPEED.MAX,
      },
      title: { type: 'string', maxLength: AUDIO_FILE_TITLE_MAX_LENGTH },
    },
    additionalProperties: false,
  },
};
