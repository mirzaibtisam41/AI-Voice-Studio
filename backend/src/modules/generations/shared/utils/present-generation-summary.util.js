import {
  GENERATION_INPUT_PREVIEW_LENGTH,
  GENERATION_OUTPUT_PREVIEW_LENGTH,
} from '#src/modules/generations/generation-history.constants.js';

function truncate(text, length) {
  if (typeof text !== 'string') return null;

  return text.length > length ? `${text.slice(0, length)}…` : text;
}

function toId(value) {
  return value ? String(value._id ?? value) : null;
}

export function presentGenerationSummaryUtil({ generation }) {
  const input = generation.input ?? {};
  const output = generation.output ?? {};

  return {
    id: String(generation._id),
    capability: generation.capability,
    status: generation.status,
    providerModelId: generation.providerModelId,
    creditsHeld: generation.creditsHeld,
    creditsCharged: generation.creditsCharged,
    creditsRefunded: generation.creditsRefunded,
    units: generation.units,
    input: {
      text: truncate(
        input.text ?? input.message,
        GENERATION_INPUT_PREVIEW_LENGTH,
      ),
      voiceCode: input.voiceCode ?? null,
      format: input.format ?? null,
      language: input.language ?? null,
      agentId: toId(input.agentId),
    },
    output: {
      audioFileId: toId(output.audioFileId),
      durationSeconds: output.durationSeconds ?? null,
      transcriptPreview: truncate(
        output.editedTranscriptText ?? output.transcriptText,
        GENERATION_OUTPUT_PREVIEW_LENGTH,
      ),
      replyPreview: truncate(output.reply, GENERATION_OUTPUT_PREVIEW_LENGTH),
    },
    errorCategory: generation.errorCategory ?? null,
    createdAt: generation.createdAt,
    completedAt: generation.completedAt ?? null,
  };
}
