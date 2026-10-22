import { VoiceModel } from '#src/modules/voices/voice.model.js';

export function findEnabledVoiceByCodeRepository({ code }) {
  return VoiceModel.findOne({ code: code.toLowerCase(), enabled: true });
}
