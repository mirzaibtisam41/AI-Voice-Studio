import { GenerationModel } from '#src/modules/generations/generation.model.js';
import { buildTranscriptionsFilterUtil } from '#src/modules/transcriptions/shared/utils/index.js';

export function updateUserTranscriptionOutputRepository({
  userId,
  transcriptionId,
  output,
}) {
  const changes = Object.fromEntries(
    Object.entries(output).map(([key, value]) => [`output.${key}`, value]),
  );

  return GenerationModel.findOneAndUpdate(
    { ...buildTranscriptionsFilterUtil({ userId }), _id: transcriptionId },
    { $set: changes },
    { returnDocument: 'after' },
  );
}
