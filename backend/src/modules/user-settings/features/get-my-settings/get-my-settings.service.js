import { findOrCreateUserSettingsRepository } from '#src/modules/user-settings/shared/repositories/index.js';

export function getMySettingsService({ userId }) {
  return findOrCreateUserSettingsRepository({ userId });
}
