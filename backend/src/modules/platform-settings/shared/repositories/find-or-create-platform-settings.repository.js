import { PlatformSettingsModel } from '#src/modules/platform-settings/platform-settings.model.js';
import { PLATFORM_SETTINGS_KEY } from '#src/modules/platform-settings/platform-settings.constants.js';

export function findOrCreatePlatformSettingsRepository({ session } = {}) {
  return PlatformSettingsModel.findOneAndUpdate(
    { key: PLATFORM_SETTINGS_KEY },
    { $setOnInsert: { key: PLATFORM_SETTINGS_KEY } },
    {
      upsert: true,
      returnDocument: 'after',
      setDefaultsOnInsert: true,
      session,
    },
  );
}
