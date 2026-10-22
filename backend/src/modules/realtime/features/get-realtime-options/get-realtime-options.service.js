import { AI_CAPABILITY } from '#src/constants/index.js';
import { listPricedModelsService } from '#src/modules/ai-models/shared/services/index.js';
import { AGENT_RESPONSE_STYLES } from '#src/modules/agents/agent.constants.js';
import { getPlatformSettingsService } from '#src/modules/platform-settings/shared/services/index.js';
import { REALTIME_INSTRUCTIONS_MAX_LENGTH } from '#src/modules/realtime/realtime.constants.js';
import { listEnabledVoicesRepository } from '#src/modules/realtime/shared/repositories/index.js';

function presentPricedModel({ pricedModel }) {
  return {
    id: pricedModel.model._id.toString(),
    name: pricedModel.model.name,
    providerModelId: pricedModel.model.providerModelId,
    creditsPerMinute: pricedModel.creditsPerUnit,
    isDefault: pricedModel.isDefault,
  };
}

function findDefaultRate({ pricedModels }) {
  const chosen =
    pricedModels.find((item) => item.isDefault) ?? pricedModels[0] ?? null;

  return chosen?.creditsPerUnit ?? null;
}

export async function getRealtimeOptionsService() {
  const [realtimeModels, agentModels, voices, settings] = await Promise.all([
    listPricedModelsService({ capability: AI_CAPABILITY.REALTIME }),
    listPricedModelsService({ capability: AI_CAPABILITY.VOICE_AGENT }),
    listEnabledVoicesRepository(),
    getPlatformSettingsService(),
  ]);

  return {
    models: realtimeModels.map((pricedModel) =>
      presentPricedModel({ pricedModel }),
    ),
    agentModels: agentModels.map((pricedModel) =>
      presentPricedModel({ pricedModel }),
    ),
    voices: voices.map((voice) => ({
      code: voice.code,
      name: voice.name,
      gender: voice.gender,
      accent: voice.accent,
      tags: voice.tags,
      description: voice.description,
    })),
    responseStyles: AGENT_RESPONSE_STYLES,
    instructionsMaxLength: REALTIME_INSTRUCTIONS_MAX_LENGTH,
    maxMinutes: settings.realtimeMaxMinutes,
    rates: {
      realtime: findDefaultRate({ pricedModels: realtimeModels }),
      voiceAgent: findDefaultRate({ pricedModels: agentModels }),
    },
  };
}
