export const CAPABILITY_TAGS = ['TTS', 'STT', 'Realtime', 'Agents', 'Chat'];

export const CAPABILITY_LABELS = {
  TTS: 'Text to Speech',
  STT: 'Speech to Text',
  Realtime: 'Real-time conversation',
  Agents: 'Voice agents',
  Chat: 'Agent chat',
};

export const ADMIN_PROVIDERS = [
  {
    id: 'openai',
    name: 'OpenAI',
    code: 'openai',
    baseUrl: 'https://api.openai.com/v1',
    capabilities: ['TTS', 'STT', 'Realtime', 'Agents', 'Chat'],
    enabled: true,
    keyLast4: '4f2a',
  },
];

export const ADMIN_MODELS = [
  {
    id: 'gpt-realtime-2.1-mini',
    name: 'GPT Realtime 2.1 mini',
    providerModelId: 'gpt-realtime-2.1-mini',
    provider: 'OpenAI',
    capabilities: ['TTS', 'Realtime', 'Agents'],
    enabled: true,
    status: 'active',
    note: 'Speech generation, live conversations and voice agents',
  },
  {
    id: 'gpt-transcribe',
    name: 'GPT Transcribe',
    providerModelId: 'gpt-transcribe',
    provider: 'OpenAI',
    capabilities: ['STT'],
    enabled: true,
    status: 'active',
    note: '25 MB uploads, automatic language detection',
  },
  {
    id: 'gpt-5-nano',
    name: 'GPT-5 nano',
    providerModelId: 'gpt-5-nano',
    provider: 'OpenAI',
    capabilities: ['Agents', 'Chat'],
    enabled: true,
    status: 'active',
    note: 'Agent text chat and prompt helpers',
  },
  {
    id: 'gpt-realtime-2.1',
    name: 'GPT Realtime 2.1',
    providerModelId: 'gpt-realtime-2.1',
    provider: 'OpenAI',
    capabilities: ['TTS', 'Realtime', 'Agents'],
    enabled: false,
    status: 'active',
    note: 'Higher quality, about 3× the cost of mini',
  },
  {
    id: 'gpt-4o-mini-tts',
    name: 'GPT-4o mini TTS',
    providerModelId: 'gpt-4o-mini-tts',
    provider: 'OpenAI',
    capabilities: ['TTS'],
    enabled: false,
    status: 'deprecated',
    note: 'Shuts down Jan 6, 2027',
  },
];

export const DEFAULT_MODELS = {
  TTS: 'gpt-realtime-2.1-mini',
  STT: 'gpt-transcribe',
  Realtime: 'gpt-realtime-2.1-mini',
  Agents: 'gpt-realtime-2.1-mini',
  Chat: 'gpt-5-nano',
};

const NO = { support: 'no' };
const YES = { support: 'yes' };
const CUSTOM_VOICE = {
  support: 'limited',
  note: 'Needs OpenAI custom voice approval',
};
const REVOICE = {
  support: 'limited',
  note: 'Transcribe then re-voice; original prosody is not kept',
};
const LIVE_TRANSCRIPTION = {
  support: 'limited',
  note: 'Live input transcription only, no file uploads',
};

export const CAPABILITY_MATRIX = [
  {
    id: 'tts',
    label: 'Text to Speech',
    cells: {
      'gpt-realtime-2.1-mini': YES,
      'gpt-transcribe': NO,
      'gpt-5-nano': NO,
      'gpt-realtime-2.1': YES,
      'gpt-4o-mini-tts': {
        support: 'limited',
        note: 'Deprecated, shuts down Jan 6, 2027',
      },
    },
  },
  {
    id: 'stt',
    label: 'Speech to Text',
    cells: {
      'gpt-realtime-2.1-mini': LIVE_TRANSCRIPTION,
      'gpt-transcribe': YES,
      'gpt-5-nano': NO,
      'gpt-realtime-2.1': LIVE_TRANSCRIPTION,
      'gpt-4o-mini-tts': NO,
    },
  },
  {
    id: 'realtime',
    label: 'Real-time conversation',
    cells: {
      'gpt-realtime-2.1-mini': YES,
      'gpt-transcribe': NO,
      'gpt-5-nano': NO,
      'gpt-realtime-2.1': YES,
      'gpt-4o-mini-tts': NO,
    },
  },
  {
    id: 'agents',
    label: 'Voice agents',
    cells: {
      'gpt-realtime-2.1-mini': YES,
      'gpt-transcribe': NO,
      'gpt-5-nano': {
        support: 'limited',
        note: 'Text chat only; pairs with a realtime model for voice',
      },
      'gpt-realtime-2.1': YES,
      'gpt-4o-mini-tts': NO,
    },
  },
  {
    id: 'cloning',
    label: 'Voice cloning',
    cells: {
      'gpt-realtime-2.1-mini': CUSTOM_VOICE,
      'gpt-transcribe': NO,
      'gpt-5-nano': NO,
      'gpt-realtime-2.1': CUSTOM_VOICE,
      'gpt-4o-mini-tts': NO,
    },
  },
  {
    id: 'transformation',
    label: 'Voice transformation',
    cells: {
      'gpt-realtime-2.1-mini': REVOICE,
      'gpt-transcribe': NO,
      'gpt-5-nano': NO,
      'gpt-realtime-2.1': REVOICE,
      'gpt-4o-mini-tts': NO,
    },
  },
  {
    id: 'enhancement',
    label: 'Audio enhancement',
    cells: {
      'gpt-realtime-2.1-mini': NO,
      'gpt-transcribe': NO,
      'gpt-5-nano': NO,
      'gpt-realtime-2.1': NO,
      'gpt-4o-mini-tts': NO,
    },
  },
  {
    id: 'speakers',
    label: 'Speaker labels',
    cells: {
      'gpt-realtime-2.1-mini': NO,
      'gpt-transcribe': {
        support: 'limited',
        note: 'Diarization in beta, up to 4 speakers',
      },
      'gpt-5-nano': NO,
      'gpt-realtime-2.1': NO,
      'gpt-4o-mini-tts': NO,
    },
  },
];

export const CAPABILITY_LIMITS = [
  {
    id: 'tts',
    label: 'Text to Speech',
    limits: [
      ['Max input', '5,000 characters'],
      ['Output formats', 'MP3, WAV, OGG'],
      ['Languages', '57'],
    ],
  },
  {
    id: 'stt',
    label: 'Speech to Text',
    limits: [
      ['Max upload', '25 MB'],
      ['Input formats', 'MP3, MP4, M4A, WAV, WEBM'],
      ['Languages', 'Auto-detect, 57'],
    ],
  },
  {
    id: 'realtime',
    label: 'Real-time conversation',
    limits: [
      ['Max session', '30 minutes'],
      ['Transport', 'WebRTC, WebSocket'],
      ['Languages', '57'],
    ],
  },
  {
    id: 'agents',
    label: 'Voice agents',
    limits: [
      ['Max session', '30 minutes'],
      ['Tools per agent', '12'],
      ['Knowledge files', '10 × 10 MB'],
    ],
  },
  {
    id: 'cloning',
    label: 'Voice cloning',
    limits: [
      ['Samples', '1 to 5 clips'],
      ['Sample length', '10 s to 2 min'],
      ['Consent', 'Required, reviewed'],
    ],
  },
  {
    id: 'enhancement',
    label: 'Audio enhancement',
    limits: [
      ['Max upload', '50 MB'],
      ['Max length', '20 minutes'],
      ['Formats', 'MP3, WAV, M4A'],
    ],
  },
];
