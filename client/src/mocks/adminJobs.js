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

const INPUT_BY_TYPE = {
  TTS: (seed) => `${1200 + seed * 137} characters · voice Marin · MP3`,
  STT: (seed) => `interview_${seed}.m4a · ${(2 + seed * 0.7).toFixed(1)} MB`,
  Realtime: () => 'Playground session · voice Cedar',
  Agent: () => 'Support agent “Brightdesk Concierge”',
};

const JOB_ROWS = [
  ['job_8f2a1c', 'u1', 'Amelia Chen', 'TTS', 'completed', 4210, 38, '09:41'],
  ['job_8f29d4', 'u3', 'Sana Ibrahim', 'STT', 'processing', 60, 0, '09:39'],
  ['job_8f27b0', 'u7', 'Hannah Okafor', 'Agent', 'failed', 0, 0, '09:36'],
  ['job_8f25e8', 'u5', 'Ines Moreau', 'TTS', 'queued', 0, 0, '09:35'],
  [
    'job_8f2311',
    'u2',
    'Marcus Webb',
    'Realtime',
    'completed',
    140,
    412,
    '09:31',
  ],
  ['job_8f20ac', 'u8', 'Kenji Watanabe', 'STT', 'failed', 0, 0, '09:27'],
  ['job_8f1e72', 'u3', 'Sana Ibrahim', 'TTS', 'completed', 12880, 96, '09:22'],
  ['job_8f1c09', 'u1', 'Amelia Chen', 'STT', 'completed', 45, 41, '09:18'],
  ['job_8f19d3', 'u9', 'Lucía Fernández', 'TTS', 'failed', 0, 0, '09:14'],
  [
    'job_8f1764',
    'u7',
    'Hannah Okafor',
    'Agent',
    'completed',
    312,
    780,
    '09:09',
  ],
  [
    'job_8f1530',
    'u11',
    'Priya Raman',
    'Realtime',
    'processing',
    80,
    0,
    '09:06',
  ],
  ['job_8f12f8', 'u5', 'Ines Moreau', 'TTS', 'completed', 2675, 24, '09:01'],
  ['job_8f10b1', 'u6', 'Tomás Rivera', 'STT', 'queued', 0, 0, '08:58'],
  ['job_8f0e4a', 'u2', 'Marcus Webb', 'TTS', 'completed', 980, 11, '08:52'],
  ['job_8f0c12', 'u3', 'Sana Ibrahim', 'Agent', 'failed', 0, 0, '08:47'],
  [
    'job_8f09e7',
    'u8',
    'Kenji Watanabe',
    'Realtime',
    'completed',
    220,
    640,
    '08:40',
  ],
  ['job_8f07a5', 'u1', 'Amelia Chen', 'TTS', 'completed', 3320, 31, '08:36'],
  ['job_8f0561', 'u10', 'Oliver Grant', 'STT', 'completed', 15, 162, '08:29'],
  ['job_8f0320', 'u7', 'Hannah Okafor', 'Realtime', 'failed', 0, 0, '08:21'],
  ['job_8f00dc', 'u5', 'Ines Moreau', 'STT', 'completed', 70, 812, '08:14'],
  ['job_8efe93', 'u3', 'Sana Ibrahim', 'TTS', 'completed', 7640, 70, '08:06'],
  ['job_8efc4f', 'u2', 'Marcus Webb', 'Agent', 'completed', 168, 503, '07:58'],
  ['job_8efa08', 'u11', 'Priya Raman', 'TTS', 'completed', 1540, 15, '07:51'],
  ['job_8ef7c6', 'u9', 'Lucía Fernández', 'STT', 'completed', 25, 274, '07:43'],
];

const FAILURES = [
  {
    category: 'provider_timeout',
    message: 'OpenAI did not respond within 60 s.',
    held: 1840,
  },
  {
    category: 'unsupported_format',
    message: 'Upload is not a supported audio container.',
    held: 35,
  },
  {
    category: 'content_policy',
    message: 'Input was rejected by the provider safety system.',
    held: 2210,
  },
  {
    category: 'rate_limited',
    message: 'Provider rate limit reached for the project key.',
    held: 240,
  },
  {
    category: 'session_dropped',
    message: 'WebRTC connection closed by the client after 12 s.',
    held: 80,
  },
];

export const ADMIN_JOBS = JOB_ROWS.map(
  ([id, userId, userName, type, status, credits, duration, time], index) => {
    const failedBefore = JOB_ROWS.slice(0, index).filter(
      (row) => row[4] === 'failed',
    ).length;
    const failure = status === 'failed' ? FAILURES[failedBefore] : null;

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
