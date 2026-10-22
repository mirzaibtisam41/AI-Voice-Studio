import { UserSettingsModel } from '#src/modules/user-settings/user-settings.model.js';

export function findUserSettingsByUserIdRepository({ userId }) {
  return UserSettingsModel.findOne({ userId });
}
