import {
  CREDITS_PER_MINUTE,
  perMinuteCredits,
  ttsCredits,
} from '@/constants/pricing';

export const JOB_TYPES = ['TTS', 'STT', 'Realtime', 'Agent'];

export const JOB_STATUSES = {
  completed: { label: 'Completed', tone: 'success' },
  processing: { label: 'Processing', tone: 'info' },
  queued: { label: 'Queued', tone: 'neutral' },
  failed: { label: 'Failed', tone: 'danger' },
};

const MODEL_BY_TYPE = {
  TTS: 'gpt-realtime-2.1-mini',
  STT: 'gpt-transcribe',
  Realtime: 'gpt-realtime-2.1-mini',
  Agent: 'gpt-realtime-2.1-mini',
};

function ttsCharacters(seed) {
  return 150 + seed * 17;
}

const INPUT_BY_TYPE = {
  TTS: (seed) => `${ttsCharacters(seed)} characters · voice Marin · MP3`,
  STT: (seed) => `interview_${seed}.m4a · ${(2 + seed * 0.7).toFixed(1)} MB`,
  Realtime: () => 'Playground session · voice Cedar',
  Agent: () => 'Support agent “Brightdesk Concierge”',
};

const COMPLETED_CREDITS = {
  TTS: (seed) => ttsCredits(ttsCharacters(seed)),
  STT: (seed, duration) =>
    perMinuteCredits(duration, CREDITS_PER_MINUTE.speechToText),
  Realtime: (seed, duration) =>
    perMinuteCredits(duration, CREDITS_PER_MINUTE.realtime),
  Agent: (seed, duration) =>
    perMinuteCredits(duration, CREDITS_PER_MINUTE.realtime),
};

const PROCESSING_HOLD = { STT: 2, Realtime: 3, TTS: 3, Agent: 3 };

const JOB_ROWS = [
  ['job_8f2a1c', 'u1', 'Amelia Chen', 'TTS', 'completed', 11, '09:41'],
  ['job_8f29d4', 'u3', 'Sana Ibrahim', 'STT', 'processing', 0, '09:39'],
  ['job_8f27b0', 'u7', 'Hannah Okafor', 'Agent', 'failed', 0, '09:36'],
  ['job_8f25e8', 'u5', 'Ines Moreau', 'TTS', 'queued', 0, '09:35'],
  ['job_8f2311', 'u2', 'Marcus Webb', 'Realtime', 'completed', 96, '09:31'],
  ['job_8f20ac', 'u8', 'Kenji Watanabe', 'STT', 'failed', 0, '09:27'],
  ['job_8f1e72', 'u3', 'Sana Ibrahim', 'TTS', 'completed', 18, '09:22'],
  ['job_8f1c09', 'u1', 'Amelia Chen', 'STT', 'completed', 41, '09:18'],
  ['job_8f19d3', 'u9', 'Lucía Fernández', 'TTS', 'failed', 0, '09:14'],
  ['job_8f1764', 'u7', 'Hannah Okafor', 'Agent', 'completed', 104, '09:09'],
  ['job_8f1530', 'u11', 'Priya Raman', 'Realtime', 'processing', 0, '09:06'],
  ['job_8f12f8', 'u5', 'Ines Moreau', 'TTS', 'completed', 24, '09:01'],
  ['job_8f10b1', 'u6', 'Tomás Rivera', 'STT', 'queued', 0, '08:58'],
  ['job_8f0e4a', 'u2', 'Marcus Webb', 'TTS', 'completed', 26, '08:52'],
  ['job_8f0c12', 'u3', 'Sana Ibrahim', 'Agent', 'failed', 0, '08:47'],
  ['job_8f09e7', 'u8', 'Kenji Watanabe', 'Realtime', 'completed', 58, '08:40'],
  ['job_8f07a5', 'u1', 'Amelia Chen', 'TTS', 'completed', 29, '08:36'],
  ['job_8f0561', 'u10', 'Oliver Grant', 'STT', 'completed', 162, '08:29'],
  ['job_8f0320', 'u7', 'Hannah Okafor', 'Realtime', 'failed', 0, '08:21'],
  ['job_8f00dc', 'u5', 'Ines Moreau', 'STT', 'completed', 212, '08:14'],
  ['job_8efe93', 'u3', 'Sana Ibrahim', 'TTS', 'completed', 34, '08:06'],
  ['job_8efc4f', 'u2', 'Marcus Webb', 'Agent', 'completed', 47, '07:58'],
  ['job_8efa08', 'u11', 'Priya Raman', 'TTS', 'completed', 36, '07:51'],
  ['job_8ef7c6', 'u9', 'Lucía Fernández', 'STT', 'completed', 274, '07:43'],
];

const FAILURES = [
  {
    category: 'provider_timeout',
    message: 'OpenAI did not respond within 60 s.',
    held: 6,
  },
  {
    category: 'unsupported_format',
    message: 'Upload is not a supported audio container.',
    held: 2,
  },
  {
    category: 'content_policy',
    message: 'Input was rejected by the provider safety system.',
    held: 5,
  },
  {
    category: 'rate_limited',
    message: 'Provider rate limit reached for the project key.',
    held: 3,
  },
  {
    category: 'session_dropped',
    message: 'WebRTC connection closed by the client after 12 s.',
    held: 3,
  },
];

function jobCredits(type, status, seed, duration) {
  if (status === 'completed') return COMPLETED_CREDITS[type](seed, duration);
  if (status === 'processing') return PROCESSING_HOLD[type];

  return 0;
}

export const ADMIN_JOBS = JOB_ROWS.map(
  ([id, userId, userName, type, status, duration, time], index) => {
    const failedBefore = JOB_ROWS.slice(0, index).filter(
      (row) => row[4] === 'failed',
    ).length;
    const failure = status === 'failed' ? FAILURES[failedBefore] : null;
    const credits = jobCredits(type, status, index + 1, duration);

    return {
      id,
      userId,
      userName,
      type,
      model: MODEL_BY_TYPE[type],
      status,
      credits,
      durationSec: duration,
      startedAt: `2026-10-22T${time}:00`,
      input: INPUT_BY_TYPE[type](index + 1),
      errorCategory: failure?.category ?? null,
      errorMessage: failure?.message ?? null,
      creditsHeld: failure ? failure.held : credits,
      refunded: false,
    };
  },
);

export const RECENT_FAILED_JOBS = ADMIN_JOBS.filter(
  (job) => job.status === 'failed',
).slice(0, 5);
