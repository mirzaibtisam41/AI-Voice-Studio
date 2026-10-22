import { AI_CAPABILITY } from '#src/constants/index.js';
import {
  BadRequestError,
  NotFoundError,
  PayloadTooLargeError,
  UnsupportedMediaTypeError,
  calculateCreditsUtil,
} from '#src/utils/index.js';
import { resolvePricedModelService } from '#src/modules/ai-models/shared/services/index.js';
import { findCreditWalletByUserIdRepository } from '#src/modules/credit-wallets/shared/repositories/index.js';
import {
  completeGenerationService,
  startGenerationService,
} from '#src/modules/generations/shared/services/index.js';
import {
  TRANSCRIPTION_FILE_EXTENSIONS,
  TRANSCRIPTION_PROVIDER_MAX_MEGABYTES,
} from '#src/modules/transcriptions/transcription.constants.js';
import {
  findUserAudioFileByIdRepository,
  updateAudioFileHasTranscriptRepository,
} from '#src/modules/transcriptions/shared/repositories/index.js';
import {
  failTranscriptionAndThrowService,
  presentTranscriptionsService,
} from '#src/modules/transcriptions/shared/services/index.js';

const BYTES_PER_MEGABYTE = 1024 * 1024;

async function findTranscribableAudioFile({ userId, audioFileId }) {
  const audioFile = await findUserAudioFileByIdRepository({
    userId,
    audioFileId,
  });

  if (!audioFile) {
    throw new NotFoundError('Audio file not found');
  }

  const extension = TRANSCRIPTION_FILE_EXTENSIONS[audioFile.format];

  if (!extension) {
    throw new UnsupportedMediaTypeError(
      'This audio format cannot be transcribed. Use MP3, WAV, M4A, WEBM, OGG or FLAC.',
    );
  }

  if (
    audioFile.sizeBytes >
    TRANSCRIPTION_PROVIDER_MAX_MEGABYTES * BYTES_PER_MEGABYTE
  ) {
    throw new PayloadTooLargeError(
      `Audio files up to ${TRANSCRIPTION_PROVIDER_MAX_MEGABYTES} MB can be transcribed`,
    );
  }

  if (!audioFile.durationSeconds) {
    throw new BadRequestError(
      'We could not read the length of this audio file, so it cannot be transcribed',
    );
  }

  return { audioFile, extension };
}

function cleanKeywords({ keywords }) {
  const cleaned = (keywords ?? []).map((keyword) => keyword.trim());

  return [...new Set(cleaned)].filter(Boolean);
}

export async function createTranscriptionService({
  server,
  log,
  userId,
  data,
}) {
  const { audioFile, extension } = await findTranscribableAudioFile({
    userId,
    audioFileId: data.audioFileId,
  });
  const pricedModel = await resolvePricedModelService({
    capability: AI_CAPABILITY.SPEECH_TO_TEXT,
    modelId: data.modelId,
  });
  const seconds = Math.max(1, Math.ceil(audioFile.durationSeconds));
  const languages = data.languages ?? [];
  const keywords = cleanKeywords({ keywords: data.keywords });

  const generation = await startGenerationService({
    userId,
    pricedModel,
    units: seconds,
    creditsHeld: calculateCreditsUtil({
      unit: pricedModel.unit,
      creditsPerUnit: pricedModel.creditsPerUnit,
      quantity: seconds,
    }),
    input: {
      sourceAudioFileId: audioFile._id,
      language: languages.length > 0 ? languages.join(',') : null,
      keywords,
    },
    reason: `Transcription of ${audioFile.title}`,
  });

  let result;

  try {
    const audio = await server.storage.downloadFile({
      key: audioFile.storageKey,
    });

    result = await server.ai.transcribeAudio({
      model: pricedModel.model.providerModelId,
      audio,
      fileName: `${audioFile._id}.${extension}`,
      contentType: audioFile.contentType,
      languages: languages.length > 0 ? languages : undefined,
      keywords: keywords.length > 0 ? keywords : undefined,
    });
  } catch (error) {
    await failTranscriptionAndThrowService({ log, generation, error });
  }

  const completed = await completeGenerationService({
    generationId: generation._id,
    units: seconds,
    output: {
      transcriptText: result.text,
      languages: result.languages ?? [],
      durationSeconds: audioFile.durationSeconds,
    },
  });

  await updateAudioFileHasTranscriptRepository({
    userId,
    audioFileId: audioFile._id,
    hasTranscript: true,
  });

  const [transcription] = await presentTranscriptionsService({
    userId,
    transcriptions: [completed],
  });
  const wallet = await findCreditWalletByUserIdRepository({ userId });

  return { transcription, balance: wallet.balance };
}
