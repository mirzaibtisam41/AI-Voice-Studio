import { UserSettingsModel } from '#src/modules/user-settings/user-settings.model.js';

export function updateUserSettingsRepository({ userId, changes }) {
  return UserSettingsModel.findOneAndUpdate(
    { userId },
    { $set: changes },
    { returnDocument: 'after', runValidators: true },
  );
}
