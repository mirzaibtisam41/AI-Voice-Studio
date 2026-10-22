import { UserSettingsModel } from '#src/modules/user-settings/user-settings.model.js';

export function findOrCreateUserSettingsRepository({ userId }) {
  return UserSettingsModel.findOneAndUpdate(
    { userId },
    { $setOnInsert: { userId } },
    { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true },
  );
}
