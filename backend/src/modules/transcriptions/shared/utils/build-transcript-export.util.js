import {
  TRANSCRIPT_EXPORT_CONTENT_TYPE,
  TRANSCRIPT_EXPORT_FORMAT,
} from '#src/modules/transcriptions/transcription.constants.js';

function formatTimestamp({ seconds, separator }) {
  const totalMs = Math.max(0, Math.round(seconds * 1000));
  const hours = Math.floor(totalMs / 3600000);
  const minutes = Math.floor((totalMs % 3600000) / 60000);
  const secs = Math.floor((totalMs % 60000) / 1000);
  const ms = totalMs % 1000;
  const pad = (value, size = 2) => String(value).padStart(size, '0');

  return `${pad(hours)}:${pad(minutes)}:${pad(secs)}${separator}${pad(ms, 3)}`;
}

function toCueText({ text }) {
  return text
    .replace(/\r\n?/g, '\n')
    .replace(/\n{2,}/g, '\n')
    .trim();
}

function buildSingleCueRange({ durationSeconds, separator }) {
  const start = formatTimestamp({ seconds: 0, separator });
  const end = formatTimestamp({ seconds: durationSeconds ?? 0, separator });

  return `${start} --> ${end}`;
}

function buildBody({ format, text, durationSeconds }) {
  if (format === TRANSCRIPT_EXPORT_FORMAT.SRT) {
    const range = buildSingleCueRange({ durationSeconds, separator: ',' });

    return `1\n${range}\n${toCueText({ text })}\n`;
  }

  if (format === TRANSCRIPT_EXPORT_FORMAT.VTT) {
    const range = buildSingleCueRange({ durationSeconds, separator: '.' });

    return `WEBVTT\n\n${range}\n${toCueText({ text })}\n`;
  }

  return `${text}\n`;
}

function buildFileName({ title, format }) {
  const base =
    (title ?? '')
      .replace(/[^\w\- ]+/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .slice(0, 80) || 'transcript';

  return `${base}.${format}`;
}

export function buildTranscriptExportUtil({
  format,
  text,
  durationSeconds,
  title,
}) {
  return {
    body: buildBody({ format, text: text ?? '', durationSeconds }),
    contentType: TRANSCRIPT_EXPORT_CONTENT_TYPE[format],
    fileName: buildFileName({ title, format }),
  };
}
