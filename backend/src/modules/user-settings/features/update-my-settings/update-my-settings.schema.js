import { AUDIO_FORMATS } from '#src/modules/audio-files/audio-file.constants.js';
import {
  USER_SETTINGS_LANGUAGE_MAX_LENGTH,
  USER_SETTINGS_LANGUAGE_MIN_LENGTH,
  USER_SETTINGS_LOW_CREDITS_THRESHOLD_MAX,
  USER_SETTINGS_VOICE_CODE_MAX_LENGTH,
} from '#src/modules/user-settings/user-settings.constants.js';

export const updateMySettingsSchema = {
  body: {
    type: 'object',
    minProperties: 1,
    properties: {
      defaultVoiceCode: {
        anyOf: [
          {
            type: 'string',
            minLength: 1,
            maxLength: USER_SETTINGS_VOICE_CODE_MAX_LENGTH,
          },
          { type: 'null' },
        ],
      },
      defaultFormat: { type: 'string', enum: AUDIO_FORMATS },
      defaultLanguage: {
        type: 'string',
        minLength: USER_SETTINGS_LANGUAGE_MIN_LENGTH,
        maxLength: USER_SETTINGS_LANGUAGE_MAX_LENGTH,
        pattern: '^[A-Za-z]+(-[A-Za-z0-9]+)*$',
      },
      notifications: {
        type: 'object',
        minProperties: 1,
        properties: {
          generationFinished: { type: 'boolean' },
          lowCredits: { type: 'boolean' },
          lowCreditsThreshold: {
            type: 'integer',
            minimum: 0,
            maximum: USER_SETTINGS_LOW_CREDITS_THRESHOLD_MAX,
          },
          weeklySummary: { type: 'boolean' },
          productUpdates: { type: 'boolean' },
        },
        additionalProperties: false,
      },
    },
    additionalProperties: false,
  },
};
