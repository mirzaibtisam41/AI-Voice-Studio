function readAscii({ buffer, start, end }) {
  return buffer.length >= end ? buffer.toString('latin1', start, end) : '';
}

function isMpegFrame({ buffer }) {
  if (buffer.length < 2) return false;

  const isSync = buffer[0] === 0xff && (buffer[1] & 0xe0) === 0xe0;
  const layer = (buffer[1] >> 1) & 0x03;
  const version = (buffer[1] >> 3) & 0x03;

  return isSync && layer !== 0 && version !== 1;
}

export function detectAudioContainerIntegration({ buffer }) {
  if (!buffer || buffer.length < 4) return null;

  if (readAscii({ buffer, start: 0, end: 3 }) === 'ID3') return 'mp3';

  if (
    readAscii({ buffer, start: 0, end: 4 }) === 'RIFF' &&
    readAscii({ buffer, start: 8, end: 12 }) === 'WAVE'
  ) {
    return 'wav';
  }

  if (readAscii({ buffer, start: 4, end: 8 }) === 'ftyp') return 'm4a';

  if (
    buffer[0] === 0x1a &&
    buffer[1] === 0x45 &&
    buffer[2] === 0xdf &&
    buffer[3] === 0xa3
  ) {
    return 'webm';
  }

  if (readAscii({ buffer, start: 0, end: 4 }) === 'OggS') return 'ogg';
  if (readAscii({ buffer, start: 0, end: 4 }) === 'fLaC') return 'flac';
  if (isMpegFrame({ buffer })) return 'mp3';

  return null;
}
