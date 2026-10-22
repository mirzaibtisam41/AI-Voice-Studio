import { AI_CAPABILITY } from '#src/constants/index.js';
import { AUDIO_FORMATS } from '#src/modules/audio-files/audio-file.constants.js';
import { listPricedModelsService } from '#src/modules/ai-models/shared/services/index.js';
import { getPlatformSettingsService } from '#src/modules/platform-settings/shared/services/index.js';
import {
  SPEECH_SPEED,
  SPEECH_STYLES,
} from '#src/modules/speech/speech.constants.js';
import { listEnabledVoicesRepository } from '#src/modules/speech/shared/repositories/index.js';

function presentVoice(voice) {
  return {
    id: voice._id.toString(),
    code: voice.code,
    name: voice.name,
    accent: voice.accent,
    gender: voice.gender,
    tags: voice.tags,
    description: voice.description,
  };
}

export async function getSpeechOptionsService() {
  const [pricedModels, voices, settings] = await Promise.all([
    listPricedModelsService({ capability: AI_CAPABILITY.TEXT_TO_SPEECH }),
    listEnabledVoicesRepository(),
    getPlatformSettingsService(),
  ]);

  return {
    models: pricedModels.map((pricedModel) => ({
      id: pricedModel.model._id.toString(),
      name: pricedModel.model.name,
      providerModelId: pricedModel.model.providerModelId,
      creditsPerUnit: pricedModel.creditsPerUnit,
      unit: pricedModel.unit,
      isDefault: pricedModel.isDefault,
    })),
    voices: voices.map(presentVoice),
    formats: AUDIO_FORMATS,
    styles: SPEECH_STYLES,
    maxCharacters: settings.ttsMaxCharacters,
    speeds: { min: SPEECH_SPEED.MIN, max: SPEECH_SPEED.MAX },
  };
}
