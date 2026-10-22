import { AI_CAPABILITY } from '#src/constants/index.js';
import { escapeRegexUtil } from '#src/utils/index.js';
import { GENERATION_STATUS } from '#src/modules/generations/generation.constants.js';

export function buildTranscriptionsFilterUtil({ userId, audioFileId, search }) {
  const filter = {
    userId,
    capability: AI_CAPABILITY.SPEECH_TO_TEXT,
    status: GENERATION_STATUS.COMPLETED,
    'output.transcriptText': { $ne: null },
  };

  if (audioFileId) filter['input.sourceAudioFileId'] = audioFileId;

  const text = search?.trim();

  if (text) {
    const pattern = new RegExp(escapeRegexUtil({ text }), 'i');

    filter.$or = [
      { 'output.editedTranscriptText': pattern },
      {
        'output.editedTranscriptText': null,
        'output.transcriptText': pattern,
      },
    ];
  }

  return filter;
}
