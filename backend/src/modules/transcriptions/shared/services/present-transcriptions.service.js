import { findAudioFilesByIdsRepository } from '#src/modules/transcriptions/shared/repositories/index.js';
import { presentTranscriptionUtil } from '#src/modules/transcriptions/shared/utils/index.js';

export async function presentTranscriptionsService({ userId, transcriptions }) {
  const audioFileIds = [
    ...new Set(
      transcriptions
        .map((item) => item.input?.sourceAudioFileId?.toString())
        .filter(Boolean),
    ),
  ];
  const audioFiles =
    audioFileIds.length > 0
      ? await findAudioFilesByIdsRepository({ userId, audioFileIds })
      : [];
  const titles = new Map(
    audioFiles.map((audioFile) => [audioFile._id.toString(), audioFile.title]),
  );

  return transcriptions.map((transcription) =>
    presentTranscriptionUtil({
      transcription,
      audioTitle:
        titles.get(transcription.input?.sourceAudioFileId?.toString()) ?? null,
    }),
  );
}
