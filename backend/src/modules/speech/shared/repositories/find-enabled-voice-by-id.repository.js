import { VoiceModel } from '#src/modules/voices/voice.model.js';

export function findEnabledVoiceByIdRepository({ voiceId }) {
  return VoiceModel.findOne({ _id: voiceId, enabled: true });
}
