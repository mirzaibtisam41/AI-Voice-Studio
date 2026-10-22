export const TRANSCRIPTION_AUTO_LANGUAGE = {
  code: 'auto',
  name: 'Auto-detect',
};

export const TRANSCRIPTION_LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'nl', name: 'Dutch' },
  { code: 'pl', name: 'Polish' },
  { code: 'sv', name: 'Swedish' },
  { code: 'tr', name: 'Turkish' },
  { code: 'ru', name: 'Russian' },
  { code: 'ar', name: 'Arabic' },
  { code: 'hi', name: 'Hindi' },
  { code: 'ur', name: 'Urdu' },
  { code: 'bn', name: 'Bengali' },
  { code: 'zh', name: 'Chinese' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
  { code: 'id', name: 'Indonesian' },
  { code: 'vi', name: 'Vietnamese' },
];

export const TRANSCRIPTION_LANGUAGE_CODES = TRANSCRIPTION_LANGUAGES.map(
  (language) => language.code,
);

export const TRANSCRIPTION_LANGUAGES_MAX = 3;
export const TRANSCRIPTION_KEYWORDS_MAX = 20;
export const TRANSCRIPTION_KEYWORD_MAX_LENGTH = 40;
export const TRANSCRIPTION_KEYWORD_PATTERN = '^[^<>\\r\\n]*\\S[^<>\\r\\n]*$';
export const TRANSCRIPTION_SEARCH_MAX_LENGTH = 200;
export const TRANSCRIPTION_PROVIDER_MAX_MEGABYTES = 25;

export const TRANSCRIPTION_FILE_EXTENSIONS = {
  mp3: 'mp3',
  mp4: 'mp4',
  mpeg: 'mpeg',
  mpga: 'mpga',
  m4a: 'm4a',
  wav: 'wav',
  webm: 'webm',
  ogg: 'ogg',
  opus: 'ogg',
  flac: 'flac',
};

export const TRANSCRIPT_EXPORT_FORMAT = {
  TXT: 'txt',
  SRT: 'srt',
  VTT: 'vtt',
};

export const TRANSCRIPT_EXPORT_FORMATS = Object.values(
  TRANSCRIPT_EXPORT_FORMAT,
);

export const TRANSCRIPT_EXPORT_CONTENT_TYPE = {
  [TRANSCRIPT_EXPORT_FORMAT.TXT]: 'text/plain; charset=utf-8',
  [TRANSCRIPT_EXPORT_FORMAT.SRT]: 'application/x-subrip; charset=utf-8',
  [TRANSCRIPT_EXPORT_FORMAT.VTT]: 'text/vtt; charset=utf-8',
};
