import { AI_CAPABILITY } from '#src/constants/index.js';
import {
  NotFoundError,
  PROVIDER_CATEGORIES_THAT_NEED_AN_ADMIN,
  ProviderError,
  ServiceUnavailableError,
  buildProviderFailureErrorUtil,
} from '#src/utils/index.js';
import { AUDIO_FORMAT } from '#src/modules/audio-files/audio-file.constants.js';
import { buildVoicePreviewStorageKeyUtil } from '#src/modules/audio-files/shared/utils/index.js';
import { listPricedModelsService } from '#src/modules/ai-models/shared/services/index.js';
import { VOICE_PREVIEW_TEXT } from '#src/modules/speech/speech.constants.js';
import {
  findEnabledVoiceByIdRepository,
  updateVoicePreviewKeyRepository,
} from '#src/modules/speech/shared/repositories/index.js';
import { buildSpeechInstructionsUtil } from '#src/modules/speech/shared/utils/index.js';

async function choosePreviewModel({ voice }) {
  const pricedModels = await listPricedModelsService({
    capability: AI_CAPABILITY.TEXT_TO_SPEECH,
  });
  const sameProvider = pricedModels.filter(
    (pricedModel) =>
      pricedModel.provider._id.toString() === voice.providerId.toString(),
  );
  const pricedModel =
    sameProvider.find((item) => item.isDefault) ?? sameProvider[0];

  if (!pricedModel) {
    throw new ServiceUnavailableError(
      'Voice previews are not available right now, please try again later',
    );
  }

  return pricedModel;
}

async function synthesizePreview({ server, log, voice, pricedModel }) {
  try {
    return await server.ai.synthesizeSpeech({
      model: pricedModel.model.providerModelId,
      voice: voice.code,
      text: VOICE_PREVIEW_TEXT,
      instructions: buildSpeechInstructionsUtil({}),
    });
  } catch (error) {
    if (!(error instanceof ProviderError)) throw error;

    const logDetails = {
      err: error,
      voiceId: voice._id,
      category: error.category,
    };

    if (PROVIDER_CATEGORIES_THAT_NEED_AN_ADMIN.includes(error.category)) {
      log.error(logDetails, 'Voice preview failed');
    } else {
      log.warn(logDetails, 'Voice preview failed');
    }

    throw buildProviderFailureErrorUtil({
      category: error.category,
      refundedCredits: 0,
    });
  }
}

async function createPreview({ server, log, voice }) {
  const pricedModel = await choosePreviewModel({ voice });
  const speech = await synthesizePreview({ server, log, voice, pricedModel });
  const encoded = await server.audio.encodePcm({
    pcm: speech.pcm,
    sampleRate: speech.sampleRate,
    format: AUDIO_FORMAT.MP3,
  });
  const previewStorageKey = buildVoicePreviewStorageKeyUtil({
    voiceCode: voice.code,
  });

  await server.storage.uploadFile({
    key: previewStorageKey,
    body: encoded.buffer,
    contentType: encoded.contentType,
  });
  await updateVoicePreviewKeyRepository({
    voiceId: voice._id,
    previewStorageKey,
  });

  return previewStorageKey;
}

export async function getVoicePreviewService({ server, log, voiceId }) {
  const voice = await findEnabledVoiceByIdRepository({ voiceId });

  if (!voice) {
    throw new NotFoundError('Voice not found');
  }

  const previewStorageKey =
    voice.previewStorageKey || (await createPreview({ server, log, voice }));

  return server.storage.createSignedUrl({ key: previewStorageKey });
}
