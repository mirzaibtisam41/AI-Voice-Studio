import { VoiceModel } from '#src/modules/voices/voice.model.js';

export function findVoiceByIdRepository({ session, id }) {
  return VoiceModel.findById(id).session(session ?? null);
}
