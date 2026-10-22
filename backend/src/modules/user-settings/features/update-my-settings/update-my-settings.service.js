import { BadRequestError } from '#src/utils/index.js';
import {
  findEnabledVoiceByCodeRepository,
  findOrCreateUserSettingsRepository,
  updateUserSettingsRepository,
} from '#src/modules/user-settings/shared/repositories/index.js';

function buildChanges({ data }) {
  const { notifications = {}, ...fields } = data;
  const changes = { ...fields };

  for (const [key, value] of Object.entries(notifications)) {
    changes[`notifications.${key}`] = value;
  }

  return changes;
}

export async function updateMySettingsService({ userId, data }) {
  const changes = buildChanges({ data });

  if (Object.keys(changes).length === 0) {
    throw new BadRequestError('Choose at least one setting to change');
  }

  if (typeof changes.defaultVoiceCode === 'string') {
    changes.defaultVoiceCode = changes.defaultVoiceCode.trim().toLowerCase();

    const voice = await findEnabledVoiceByCodeRepository({
      code: changes.defaultVoiceCode,
    });

    if (!voice) {
      throw new BadRequestError('Choose a voice that is available right now');
    }
  }

  if (typeof changes.defaultLanguage === 'string') {
    changes.defaultLanguage = changes.defaultLanguage.toLowerCase();
  }

  await findOrCreateUserSettingsRepository({ userId });

  return updateUserSettingsRepository({ userId, changes });
}
