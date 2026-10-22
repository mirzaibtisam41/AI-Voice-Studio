export const SIGNUP_CREDITS = 50;

export const CREDIT_VALUE_USD = 0.01;

export const TTS_CHARACTERS_PER_CREDIT = 100;

export const CREDITS_PER_MINUTE = {
  speechToText: 1,
  realtime: 3,
  voiceTransformation: 2,
  enhancement: 1,
};

export const FEATURES = {
  textToSpeech: { label: 'Text to Speech', color: 'brand' },
  speechToText: { label: 'Speech to Text', color: 'blue' },
  realtime: { label: 'Real-time', color: 'teal' },
  agents: { label: 'Agents', color: 'amber' },
  voiceCloning: { label: 'Voice Cloning', color: 'success' },
  voiceTransformation: { label: 'Voice Transformation', color: 'blue' },
  enhancement: { label: 'Enhancement', color: 'success' },
  bonus: { label: 'Bonus', color: 'success' },
  adjustment: { label: 'Adjustment', color: 'amber' },
};

export function ttsCredits(characters) {
  if (!characters) return 0;

  return Math.ceil(characters / TTS_CHARACTERS_PER_CREDIT);
}

export function perMinuteCredits(seconds, rate) {
  if (!seconds) return 0;

  return Math.ceil(seconds / 60) * rate;
}
