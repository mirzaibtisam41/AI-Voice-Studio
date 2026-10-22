import { VoiceModel } from '#src/modules/voices/voice.model.js';

export function updateVoiceRepository({ session, id, data }) {
  return VoiceModel.findByIdAndUpdate(id, data, {
    returnDocument: 'after',
    runValidators: true,
    session,
  });
}
