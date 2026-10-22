export const AUTO_LANGUAGE = 'auto';
export const UPLOAD_ACCEPT =
  '.mp3,.wav,.m4a,.webm,.ogg,.flac,audio/mpeg,audio/wav,audio/mp4,audio/webm,audio/ogg,audio/flac';

const SECONDS_PER_MINUTE = 60;
const BYTES_PER_MEGABYTE = 1024 * 1024;

export function megabytesToBytes(megabytes) {
  return megabytes * BYTES_PER_MEGABYTE;
}

export function estimateTranscriptionCredits(durationSeconds, model) {
  if (!durationSeconds || !model) return 0;

  const seconds = Math.max(1, Math.ceil(durationSeconds));

  return Math.ceil(seconds / SECONDS_PER_MINUTE) * model.creditsPerMinute;
}

export function parseKeywords(value) {
  const keywords = value
    .split(',')
    .map((keyword) => keyword.trim())
    .filter(Boolean);

  return [...new Set(keywords)];
}

export function languageName(languages, code) {
  return languages.find((language) => language.code === code)?.name ?? code;
}

export function buildExportFileName(title, format) {
  const base =
    (title ?? '')
      .replace(/[^\w\- ]+/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .slice(0, 80) || 'transcript';

  return `${base}.${format}`;
}
