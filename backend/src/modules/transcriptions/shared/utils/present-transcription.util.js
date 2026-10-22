export function presentTranscriptionUtil({ transcription, audioTitle = null }) {
  const originalText = transcription.output?.transcriptText ?? null;
  const editedText = transcription.output?.editedTranscriptText ?? null;
  const requestedLanguages = transcription.input?.language
    ? transcription.input.language.split(',')
    : [];

  return {
    id: transcription._id.toString(),
    status: transcription.status,
    audioFileId: transcription.input?.sourceAudioFileId?.toString() ?? null,
    audioTitle,
    text: editedText ?? originalText,
    originalText,
    isEdited: editedText !== null,
    languages: transcription.output?.languages ?? [],
    requestedLanguages,
    keywords: transcription.input?.keywords ?? [],
    durationSeconds: transcription.output?.durationSeconds ?? null,
    model: transcription.providerModelId,
    creditsCharged: transcription.creditsCharged,
    createdAt: transcription.createdAt,
    updatedAt: transcription.updatedAt,
  };
}
