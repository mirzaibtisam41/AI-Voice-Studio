export const AUDIO_FILE_KIND = {
  GENERATED: 'generated',
  UPLOADED: 'uploaded',
};

export const AUDIO_FILE_KINDS = Object.values(AUDIO_FILE_KIND);

export const AUDIO_FORMAT = {
  MP3: 'mp3',
  WAV: 'wav',
  OPUS: 'opus',
  AAC: 'aac',
  FLAC: 'flac',
};

export const AUDIO_FORMATS = Object.values(AUDIO_FORMAT);

export const AUDIO_FORMAT_CONTENT_TYPE = {
  mp3: 'audio/mpeg',
  wav: 'audio/wav',
  opus: 'audio/ogg',
  aac: 'audio/aac',
  flac: 'audio/flac',
  m4a: 'audio/mp4',
  webm: 'audio/webm',
  ogg: 'audio/ogg',
};

export const UPLOAD_FORMATS = ['mp3', 'wav', 'm4a', 'webm', 'ogg', 'flac'];

export const AUDIO_FILE_TITLE_MAX_LENGTH = 150;
