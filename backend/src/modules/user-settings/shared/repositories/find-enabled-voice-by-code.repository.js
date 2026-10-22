import { VoiceModel } from '#src/modules/voices/voice.model.js';

export function findEnabledVoiceByCodeRepository({ code }) {
  return VoiceModel.exists({ code, enabled: true });
}
