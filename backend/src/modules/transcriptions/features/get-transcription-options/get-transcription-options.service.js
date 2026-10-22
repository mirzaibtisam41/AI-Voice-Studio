import { AI_CAPABILITY } from '#src/constants/index.js';
import { listPricedModelsService } from '#src/modules/ai-models/shared/services/index.js';
import { getPlatformSettingsService } from '#src/modules/platform-settings/shared/services/index.js';
import {
  TRANSCRIPT_EXPORT_FORMATS,
  TRANSCRIPTION_AUTO_LANGUAGE,
  TRANSCRIPTION_KEYWORD_MAX_LENGTH,
  TRANSCRIPTION_KEYWORDS_MAX,
  TRANSCRIPTION_LANGUAGES,
  TRANSCRIPTION_LANGUAGES_MAX,
  TRANSCRIPTION_PROVIDER_MAX_MEGABYTES,
} from '#src/modules/transcriptions/transcription.constants.js';

export async function getTranscriptionOptionsService() {
  const [pricedModels, settings] = await Promise.all([
    listPricedModelsService({ capability: AI_CAPABILITY.SPEECH_TO_TEXT }),
    getPlatformSettingsService(),
  ]);

  return {
    models: pricedModels.map((pricedModel) => ({
      id: pricedModel.model._id.toString(),
      name: pricedModel.model.name,
      providerModelId: pricedModel.model.providerModelId,
      creditsPerMinute: pricedModel.creditsPerUnit,
      isDefault: pricedModel.isDefault,
    })),
    maxMegabytes: Math.min(
      settings.uploadMaxMegabytes,
      TRANSCRIPTION_PROVIDER_MAX_MEGABYTES,
    ),
    languages: [TRANSCRIPTION_AUTO_LANGUAGE, ...TRANSCRIPTION_LANGUAGES],
    maxLanguages: TRANSCRIPTION_LANGUAGES_MAX,
    maxKeywords: TRANSCRIPTION_KEYWORDS_MAX,
    keywordMaxLength: TRANSCRIPTION_KEYWORD_MAX_LENGTH,
    exportFormats: TRANSCRIPT_EXPORT_FORMATS,
  };
}
