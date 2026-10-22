export const ENHANCEMENT_OPTIONS = [
  {
    id: 'noise',
    label: 'Noise reduction',
    description: 'Remove hiss, hum and background noise',
    defaultOn: true,
  },
  {
    id: 'silence',
    label: 'Silence removal',
    description: 'Trim long pauses automatically',
    defaultOn: true,
  },
  {
    id: 'loudness',
    label: 'Loudness normalization',
    description: 'Target broadcast-standard loudness',
    defaultOn: true,
  },
  {
    id: 'deEssing',
    label: 'De-essing',
    description: 'Soften harsh sibilant sounds',
    defaultOn: false,
  },
];

export const LOUDNESS_TARGETS = [
  { value: '-16', label: '−16 LUFS · Podcast' },
  { value: '-14', label: '−14 LUFS · Streaming' },
  { value: '-23', label: '−23 LUFS · Broadcast' },
];

export const ENHANCEMENT_STATS = [
  { label: 'Noise floor', before: '−42 dB', after: '−68 dB' },
  { label: 'Loudness', before: '−23 LUFS', after: '−16 LUFS' },
  { label: 'Silence trimmed', before: '', after: '6.4s' },
];
