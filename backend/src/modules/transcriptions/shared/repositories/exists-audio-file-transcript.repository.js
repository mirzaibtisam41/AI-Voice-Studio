import { GenerationModel } from '#src/modules/generations/generation.model.js';
import { buildTranscriptionsFilterUtil } from '#src/modules/transcriptions/shared/utils/index.js';

export async function existsAudioFileTranscriptRepository({
  userId,
  audioFileId,
}) {
  const found = await GenerationModel.exists(
    buildTranscriptionsFilterUtil({ userId, audioFileId }),
  );

  return Boolean(found);
}
