import { PlatformSettingsModel } from '#src/modules/platform-settings/platform-settings.model.js';
import { PLATFORM_SETTINGS_KEY } from '#src/modules/platform-settings/platform-settings.constants.js';

export function updatePlatformSettingsRepository({ session, data }) {
  return PlatformSettingsModel.findOneAndUpdate(
    { key: PLATFORM_SETTINGS_KEY },
    { $set: data },
    {
      upsert: true,
      returnDocument: 'after',
      setDefaultsOnInsert: true,
      runValidators: true,
      session,
    },
  );
}
