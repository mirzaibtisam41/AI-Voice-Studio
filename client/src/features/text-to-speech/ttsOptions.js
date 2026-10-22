export const DEFAULT_SCRIPT =
  'Here is a preview of your script, read with natural pacing and clear emphasis on the key numbers.';

export const WARNING_RATIO = 0.9;
export const TITLE_MAX_LENGTH = 150;

const CHARACTERS_PER_UNIT = 100;

const FORMAT_LABELS = {
  mp3: 'MP3',
  wav: 'WAV',
  opus: 'Opus',
  aac: 'AAC',
  flac: 'FLAC',
};

export function formatLabel(format) {
  return FORMAT_LABELS[format] ?? String(format ?? '').toUpperCase();
}

export function styleLabel(style) {
  return style.charAt(0).toUpperCase() + style.slice(1);
}

function creditsWord(count) {
  return count === 1 ? 'credit' : 'credits';
}

export function describeUnit(model) {
  const amount = `${model.creditsPerUnit} ${creditsWord(model.creditsPerUnit)}`;

  if (model.unit === 'per_100_characters') {
    return `${amount} per ${CHARACTERS_PER_UNIT} characters, rounded up`;
  }

  if (model.unit === 'per_minute') return `${amount} per minute, rounded up`;

  return `${amount} per unit`;
}

export function estimateSpeechCredits(characterCount, model) {
  if (characterCount <= 0) return 0;

  return Math.ceil(characterCount / CHARACTERS_PER_UNIT) * model.creditsPerUnit;
}
