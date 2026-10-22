import { VoiceModel } from '#src/modules/voices/voice.model.js';

export function listVoicesRepository() {
  return VoiceModel.find().sort({ sortOrder: 1, name: 1 });
}
