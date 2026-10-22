import { VoiceModel } from '#src/modules/voices/voice.model.js';

export function findEnabledVoiceByCodeRepository({ providerId, code }) {
  return VoiceModel.findOne({ providerId, code, enabled: true });
}
