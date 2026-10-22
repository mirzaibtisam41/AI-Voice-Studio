import { AI_CAPABILITIES, CAPABILITY_DETAILS } from '#src/constants/index.js';
import { listPricedModelsService } from '#src/modules/ai-models/shared/services/index.js';
import { getPlatformSettingsService } from '#src/modules/platform-settings/shared/services/index.js';

async function buildRate({ capability }) {
  const pricedModels = await listPricedModelsService({ capability });
  const chosen = pricedModels.find((item) => item.isDefault) ?? pricedModels[0];

  if (!chosen) return null;

  return {
    capability,
    label: CAPABILITY_DETAILS[capability].label,
    unit: chosen.unit,
    creditsPerUnit: chosen.creditsPerUnit,
    modelName: chosen.model.name,
  };
}

export async function getPublicPlatformSettingsService() {
  const [settings, rates] = await Promise.all([
    getPlatformSettingsService(),
    Promise.all(AI_CAPABILITIES.map((capability) => buildRate({ capability }))),
  ]);

  return {
    settings: {
      signupCredits: settings.signupCredits,
      ttsMaxCharacters: settings.ttsMaxCharacters,
      uploadMaxMegabytes: settings.uploadMaxMegabytes,
      realtimeMaxMinutes: settings.realtimeMaxMinutes,
      agentChatMaxMessages: settings.agentChatMaxMessages,
      maintenanceMode: settings.maintenanceMode,
      maintenanceMessage: settings.maintenanceMessage,
      requireEmailVerification: settings.requireEmailVerification,
    },
    rates: rates.filter(Boolean),
  };
}
