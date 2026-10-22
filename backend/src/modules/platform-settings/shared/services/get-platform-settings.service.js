import { findOrCreatePlatformSettingsRepository } from '#src/modules/platform-settings/shared/repositories/index.js';

export function getPlatformSettingsService({ session } = {}) {
  return findOrCreatePlatformSettingsRepository({ session });
}
