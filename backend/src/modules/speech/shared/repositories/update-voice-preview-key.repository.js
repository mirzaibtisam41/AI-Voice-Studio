import { VoiceModel } from '#src/modules/voices/voice.model.js';

export function updateVoicePreviewKeyRepository({
  voiceId,
  previewStorageKey,
}) {
  return VoiceModel.updateOne(
    { _id: voiceId },
    { $set: { previewStorageKey } },
  );
}
