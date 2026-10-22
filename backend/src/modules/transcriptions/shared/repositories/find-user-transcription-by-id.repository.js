import { GenerationModel } from '#src/modules/generations/generation.model.js';
import { buildTranscriptionsFilterUtil } from '#src/modules/transcriptions/shared/utils/index.js';

export function findUserTranscriptionByIdRepository({
  userId,
  transcriptionId,
}) {
  return GenerationModel.findOne({
    ...buildTranscriptionsFilterUtil({ userId }),
    _id: transcriptionId,
  });
}
