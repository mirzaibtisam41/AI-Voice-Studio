import { UserSettingsModel } from '#src/modules/user-settings/user-settings.model.js';

export async function createUserSettingsRepository({ session, userId }) {
  const [settings] = await UserSettingsModel.create([{ userId }], { session });

  return settings;
}
