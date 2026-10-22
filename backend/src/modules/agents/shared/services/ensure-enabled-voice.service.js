import { BadRequestError } from '#src/utils/index.js';
import { findEnabledVoiceByCodeRepository } from '#src/modules/agents/shared/repositories/index.js';

export async function ensureEnabledVoiceService({ voiceCode }) {
  const voice = await findEnabledVoiceByCodeRepository({ code: voiceCode });

  if (!voice) {
    throw new BadRequestError(
      'This voice is not available right now, please choose another one',
    );
  }

  return voice;
}
