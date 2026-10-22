export function formatCredits(value) {
  return Math.round(value ?? 0).toLocaleString('en-US');
}

export function formatSignedCredits(value) {
  const sign = value > 0 ? '+' : value < 0 ? '−' : '';

  return `${sign}${Math.abs(Math.round(value)).toLocaleString('en-US')}`;
}

export function formatTimeOfDay(value) {
  return new Date(value).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function formatLogTime(value) {
  const date = new Date(value);
  const pad = (part) => String(part).padStart(2, '0');

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

const UNIT_LABELS = {
  per_100_characters: 'per 100 characters',
  per_minute: 'per minute',
  per_message: 'per message',
};

export function formatUnit(unit) {
  return UNIT_LABELS[unit] ?? unit?.replaceAll('_', ' ') ?? '';
}

export const CAPABILITY_LABELS = {
  text_to_speech: 'Text to Speech',
  speech_to_text: 'Speech to Text',
  realtime: 'Real-time conversation',
  voice_agent: 'Voice agent session',
  agent_chat: 'Agent test chat',
};

export const CAPABILITY_SHORT_LABELS = {
  text_to_speech: 'TTS',
  speech_to_text: 'STT',
  realtime: 'Realtime',
  voice_agent: 'Agents',
  agent_chat: 'Agent chat',
};

export function capabilityLabel(code) {
  return CAPABILITY_LABELS[code] ?? code;
}

export function capabilityShortLabel(code) {
  return CAPABILITY_SHORT_LABELS[code] ?? code;
}

export const CREDIT_TRANSACTION_LABELS = {
  signup_grant: 'Signup bonus',
  admin_credit: 'Admin credit',
  admin_debit: 'Admin debit',
  usage_hold: 'Usage',
  usage_refund: 'Refund',
};

export function createIdempotencyKey(prefix = 'admin') {
  const random =
    typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;

  return `${prefix}-${random}`;
}
