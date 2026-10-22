import { AI_CAPABILITY } from '#src/constants/index.js';

export const REALTIME_SESSION_CAPABILITIES = [
  AI_CAPABILITY.REALTIME,
  AI_CAPABILITY.VOICE_AGENT,
];

export const REALTIME_SESSION_KIND = {
  [AI_CAPABILITY.REALTIME]: 'playground',
  [AI_CAPABILITY.VOICE_AGENT]: 'agent',
};

export const REALTIME_INSTRUCTIONS_MAX_LENGTH = 2000;
export const REALTIME_SESSION_GRACE_MINUTES = 2;
export const REALTIME_DEFAULT_INSTRUCTIONS =
  'You are a friendly, helpful voice assistant. Answer questions clearly and ask a short follow-up question when the request is unclear.';
