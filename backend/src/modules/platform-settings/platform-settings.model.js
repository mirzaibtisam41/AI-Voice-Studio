import mongoose from 'mongoose';
import { SCHEMA_OPTIONS } from '#src/database/schema-options.js';
import {
  PLATFORM_SETTINGS_DEFAULTS,
  PLATFORM_SETTINGS_KEY,
  PLATFORM_SETTINGS_LIMITS,
} from '#src/modules/platform-settings/platform-settings.constants.js';

function limitedNumber(field) {
  return {
    type: Number,
    min: PLATFORM_SETTINGS_LIMITS[field].min,
    max: PLATFORM_SETTINGS_LIMITS[field].max,
    default: PLATFORM_SETTINGS_DEFAULTS[field],
  };
}

const platformSettingsSchema = new mongoose.Schema(
  {
    key: { type: String, default: PLATFORM_SETTINGS_KEY },
    signupCredits: limitedNumber('signupCredits'),
    requireEmailVerification: {
      type: Boolean,
      default: PLATFORM_SETTINGS_DEFAULTS.requireEmailVerification,
    },
    ttsMaxCharacters: limitedNumber('ttsMaxCharacters'),
    uploadMaxMegabytes: limitedNumber('uploadMaxMegabytes'),
    realtimeMaxMinutes: limitedNumber('realtimeMaxMinutes'),
    agentChatMaxMessages: limitedNumber('agentChatMaxMessages'),
    maintenanceMode: {
      type: Boolean,
      default: PLATFORM_SETTINGS_DEFAULTS.maintenanceMode,
    },
    maintenanceMessage: {
      type: String,
      maxlength: PLATFORM_SETTINGS_LIMITS.maintenanceMessageMaxLength,
      default: PLATFORM_SETTINGS_DEFAULTS.maintenanceMessage,
    },
  },
  SCHEMA_OPTIONS,
);

platformSettingsSchema.index(
  { key: 1 },
  { unique: true, name: 'platform_settings_key_unique' },
);

export const PlatformSettingsModel = mongoose.model(
  'PlatformSettings',
  platformSettingsSchema,
  'platform_settings',
);
