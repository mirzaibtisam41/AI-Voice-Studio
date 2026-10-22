export const AI_CAPABILITY = {
  TEXT_TO_SPEECH: 'text_to_speech',
  SPEECH_TO_TEXT: 'speech_to_text',
  REALTIME: 'realtime',
  VOICE_AGENT: 'voice_agent',
  AGENT_CHAT: 'agent_chat',
};

export const AI_CAPABILITIES = Object.values(AI_CAPABILITY);

export const PRICING_UNIT = {
  PER_100_CHARACTERS: 'per_100_characters',
  PER_MINUTE: 'per_minute',
  PER_MESSAGE: 'per_message',
};

export const CAPABILITY_DETAILS = {
  [AI_CAPABILITY.TEXT_TO_SPEECH]: {
    label: 'Text to Speech',
    unit: PRICING_UNIT.PER_100_CHARACTERS,
  },
  [AI_CAPABILITY.SPEECH_TO_TEXT]: {
    label: 'Speech to Text',
    unit: PRICING_UNIT.PER_MINUTE,
  },
  [AI_CAPABILITY.REALTIME]: {
    label: 'Real-time conversation',
    unit: PRICING_UNIT.PER_MINUTE,
  },
  [AI_CAPABILITY.VOICE_AGENT]: {
    label: 'Voice agent session',
    unit: PRICING_UNIT.PER_MINUTE,
  },
  [AI_CAPABILITY.AGENT_CHAT]: {
    label: 'Agent test chat',
    unit: PRICING_UNIT.PER_MESSAGE,
  },
};
