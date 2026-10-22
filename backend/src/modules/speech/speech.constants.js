export const SPEECH_STYLE = {
  NEUTRAL: 'neutral',
  CHEERFUL: 'cheerful',
  CALM: 'calm',
  SERIOUS: 'serious',
  WHISPER: 'whisper',
};

export const SPEECH_STYLES = Object.values(SPEECH_STYLE);

export const SPEECH_STYLE_INSTRUCTIONS = {
  [SPEECH_STYLE.NEUTRAL]: 'Use a natural, neutral and clear tone.',
  [SPEECH_STYLE.CHEERFUL]: 'Sound cheerful, warm and upbeat.',
  [SPEECH_STYLE.CALM]: 'Sound calm, relaxed and soothing.',
  [SPEECH_STYLE.SERIOUS]: 'Sound serious, steady and authoritative.',
  [SPEECH_STYLE.WHISPER]: 'Whisper softly and quietly, close to the listener.',
};

export const SPEECH_SPEED = {
  MIN: 0.5,
  MAX: 2,
  DEFAULT: 1,
};

export const SPEECH_TEXT_MAX_LENGTH = 20000;
export const SPEECH_DIRECTION_MAX_LENGTH = 300;
export const SPEECH_VOICE_CODE_MAX_LENGTH = 60;
export const SPEECH_AUTO_TITLE_LENGTH = 60;

export const VOICE_PREVIEW_TEXT =
  'Hi there! This is how I sound. I can read your scripts, stories and announcements in a clear, natural voice.';
