import { PLATFORM_SETTINGS_LIMITS } from '#src/modules/platform-settings/platform-settings.constants.js';

function limitedInteger(field) {
  return {
    type: 'integer',
    minimum: PLATFORM_SETTINGS_LIMITS[field].min,
    maximum: PLATFORM_SETTINGS_LIMITS[field].max,
  };
}

export const updatePlatformSettingsSchema = {
  body: {
    type: 'object',
    minProperties: 1,
    properties: {
      signupCredits: limitedInteger('signupCredits'),
      requireEmailVerification: { type: 'boolean' },
      ttsMaxCharacters: limitedInteger('ttsMaxCharacters'),
      uploadMaxMegabytes: limitedInteger('uploadMaxMegabytes'),
      realtimeMaxMinutes: limitedInteger('realtimeMaxMinutes'),
      agentChatMaxMessages: limitedInteger('agentChatMaxMessages'),
      maintenanceMode: { type: 'boolean' },
      maintenanceMessage: {
        type: 'string',
        maxLength: PLATFORM_SETTINGS_LIMITS.maintenanceMessageMaxLength,
      },
    },
    additionalProperties: false,
  },
};
