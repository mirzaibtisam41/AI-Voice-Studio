import { AI_CAPABILITY } from '#src/constants/index.js';
import { GenerationModel } from '#src/modules/generations/generation.model.js';
import {
  GENERATION_STATUS,
  STUCK_GENERATION_MINUTES,
} from '#src/modules/generations/generation.constants.js';

const SESSION_CAPABILITIES = [
  AI_CAPABILITY.REALTIME,
  AI_CAPABILITY.VOICE_AGENT,
];

export function findStuckGenerationsRepository({ now = new Date() } = {}) {
  const stuckBefore = new Date(
    now.getTime() - STUCK_GENERATION_MINUTES * 60 * 1000,
  );

  return GenerationModel.find({
    status: GENERATION_STATUS.PROCESSING,
    $or: [
      {
        capability: { $nin: SESSION_CAPABILITIES },
        createdAt: { $lt: stuckBefore },
      },
      {
        capability: { $in: SESSION_CAPABILITIES },
        'realtime.expiresAt': { $lt: now },
      },
    ],
  }).limit(100);
}
