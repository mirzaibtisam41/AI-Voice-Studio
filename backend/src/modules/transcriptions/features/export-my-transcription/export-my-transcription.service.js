import { getMyTranscriptionService } from '#src/modules/transcriptions/features/get-my-transcription/get-my-transcription.service.js';
import { buildTranscriptExportUtil } from '#src/modules/transcriptions/shared/utils/index.js';

export async function exportMyTranscriptionService({
  userId,
  transcriptionId,
  format,
}) {
  const transcription = await getMyTranscriptionService({
    userId,
    transcriptionId,
  });

  return buildTranscriptExportUtil({
    format,
    text: transcription.text,
    durationSeconds: transcription.durationSeconds,
    title: transcription.audioTitle,
  });
}
