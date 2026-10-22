import { VoiceModel } from '#src/modules/voices/voice.model.js';

export function listEnabledVoicesRepository() {
  return VoiceModel.find({ enabled: true }).sort({ sortOrder: 1, name: 1 });
}
