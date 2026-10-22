import mongoose from 'mongoose';
import {
  AI_CAPABILITY,
  PROVIDER_ERROR_CATEGORY,
} from '#src/constants/index.js';
import {
  BadRequestError,
  PROVIDER_CATEGORIES_THAT_NEED_AN_ADMIN,
  ProviderError,
  buildProviderFailureErrorUtil,
  calculateCreditsUtil,
} from '#src/utils/index.js';
import {
  AUDIO_FILE_KIND,
  AUDIO_FORMAT,
  AUDIO_STORAGE_FOLDER,
} from '#src/modules/audio-files/audio-file.constants.js';
import {
  createAudioFileRepository,
  deleteUserAudioFileRepository,
} from '#src/modules/audio-files/shared/repositories/index.js';
import {
  deleteAudioFileObjectsService,
  presentAudioFileService,
} from '#src/modules/audio-files/shared/services/index.js';
import { buildAudioStorageKeyUtil } from '#src/modules/audio-files/shared/utils/index.js';
import { resolvePricedModelService } from '#src/modules/ai-models/shared/services/index.js';
import { findCreditWalletByUserIdRepository } from '#src/modules/credit-wallets/shared/repositories/index.js';
import { GENERATION_STATUS } from '#src/modules/generations/generation.constants.js';
import {
  completeGenerationService,
  failGenerationService,
  startGenerationService,
} from '#src/modules/generations/shared/services/index.js';
import { getPlatformSettingsService } from '#src/modules/platform-settings/shared/services/index.js';
import {
  SPEECH_AUTO_TITLE_LENGTH,
  SPEECH_SPEED,
  SPEECH_STYLE,
} from '#src/modules/speech/speech.constants.js';
import {
  findEnabledVoiceByCodeRepository,
  findUserSettingsByUserIdRepository,
} from '#src/modules/speech/shared/repositories/index.js';
import { buildSpeechInstructionsUtil } from '#src/modules/speech/shared/utils/index.js';

async function readText({ text }) {
  const trimmed = text.trim();
  const settings = await getPlatformSettingsService();

  if (!trimmed) {
    throw new BadRequestError('Enter the text you want to hear');
  }

  if (trimmed.length > settings.ttsMaxCharacters) {
    throw new BadRequestError(
      `Keep the text under ${settings.ttsMaxCharacters} characters`,
    );
  }

  return trimmed;
}

async function readVoice({ pricedModel, voiceCode }) {
  const voice = await findEnabledVoiceByCodeRepository({
    providerId: pricedModel.provider._id,
    code: voiceCode.trim().toLowerCase(),
  });

  if (!voice) {
    throw new BadRequestError('This voice is not available');
  }

  return voice;
}

async function readFormat({ userId, format }) {
  if (format) return format;

  const userSettings = await findUserSettingsByUserIdRepository({ userId });

  return userSettings?.defaultFormat ?? AUDIO_FORMAT.MP3;
}

function buildTitle({ title, text }) {
  return (
    title?.trim() || text.slice(0, SPEECH_AUTO_TITLE_LENGTH).trim() || 'Speech'
  );
}

async function produceAudioFile({
  server,
  userId,
  generation,
  pricedModel,
  voice,
  text,
  instructions,
  format,
  title,
  created,
}) {
  const speech = await server.ai.synthesizeSpeech({
    model: pricedModel.model.providerModelId,
    voice: voice.code,
    text,
    instructions,
  });
  const encoded = await server.audio.encodePcm({
    pcm: speech.pcm,
    sampleRate: speech.sampleRate,
    format,
  });
  const audioFileId = new mongoose.Types.ObjectId();
  const storageKey = buildAudioStorageKeyUtil({
    userId,
    folder: AUDIO_STORAGE_FOLDER.GENERATED,
    audioFileId,
    extension: encoded.extension,
  });

  await server.storage.uploadFile({
    key: storageKey,
    body: encoded.buffer,
    contentType: encoded.contentType,
  });
  created.storageKey = storageKey;

  const audioFile = await createAudioFileRepository({
    data: {
      _id: audioFileId,
      userId,
      kind: AUDIO_FILE_KIND.GENERATED,
      title,
      storageKey,
      contentType: encoded.contentType,
      format,
      sizeBytes: encoded.buffer.length,
      durationSeconds: encoded.durationSeconds,
      generationId: generation._id,
      voiceCode: voice.code,
    },
  });
  created.audioFileId = audioFileId;

  const completed = await completeGenerationService({
    generationId: generation._id,
    output: { audioFileId, durationSeconds: encoded.durationSeconds },
  });

  if (completed.status !== GENERATION_STATUS.COMPLETED) {
    throw new ProviderError({ category: PROVIDER_ERROR_CATEGORY.TIMEOUT });
  }

  return { generation: completed, audioFile };
}

async function failAndThrow({
  server,
  log,
  userId,
  generation,
  created,
  error,
}) {
  const isProviderError = error instanceof ProviderError;
  const category = isProviderError
    ? error.category
    : PROVIDER_ERROR_CATEGORY.UNKNOWN;

  if (created.audioFileId) {
    await deleteUserAudioFileRepository({
      userId,
      audioFileId: created.audioFileId,
    }).catch(() => {});
  }

  await deleteAudioFileObjectsService({
    storage: server.storage,
    log,
    keys: [created.storageKey],
  });

  const { refundedCredits } = await failGenerationService({
    generationId: generation._id,
    errorCategory: category,
  });

  const logDetails = { err: error, generationId: generation._id, category };

  if (PROVIDER_CATEGORIES_THAT_NEED_AN_ADMIN.includes(category)) {
    log.error(logDetails, 'Text to speech failed');
  } else {
    log.warn(logDetails, 'Text to speech failed');
  }

  if (!isProviderError) throw error;

  throw buildProviderFailureErrorUtil({ category, refundedCredits });
}

export async function createSpeechService({ server, log, userId, data }) {
  const text = await readText({ text: data.text });
  const pricedModel = await resolvePricedModelService({
    capability: AI_CAPABILITY.TEXT_TO_SPEECH,
    modelId: data.modelId,
  });
  const voice = await readVoice({ pricedModel, voiceCode: data.voiceCode });
  const format = await readFormat({ userId, format: data.format });
  const style = data.style ?? SPEECH_STYLE.NEUTRAL;
  const speed = data.speed ?? SPEECH_SPEED.DEFAULT;
  const direction = data.direction?.trim() || null;
  const instructions = buildSpeechInstructionsUtil({
    style,
    direction,
    speed,
  });
  const creditsHeld = calculateCreditsUtil({
    unit: pricedModel.unit,
    creditsPerUnit: pricedModel.creditsPerUnit,
    quantity: text.length,
  });

  const generation = await startGenerationService({
    userId,
    pricedModel,
    units: text.length,
    creditsHeld,
    input: {
      text,
      characterCount: text.length,
      voiceCode: voice.code,
      format,
      style,
      instructions: direction,
      speed,
    },
    reason: 'Text to speech',
  });

  const created = { storageKey: null, audioFileId: null };
  let result;

  try {
    result = await produceAudioFile({
      server,
      userId,
      generation,
      pricedModel,
      voice,
      text,
      instructions,
      format,
      title: buildTitle({ title: data.title, text }),
      created,
    });
  } catch (error) {
    await failAndThrow({ server, log, userId, generation, created, error });
  }

  const wallet = await findCreditWalletByUserIdRepository({ userId });

  return {
    generation: result.generation,
    audioFile: await presentAudioFileService({
      storage: server.storage,
      audioFile: result.audioFile,
    }),
    balance: wallet?.balance ?? 0,
  };
}
