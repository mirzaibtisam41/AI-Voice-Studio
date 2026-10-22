import {
  CREDITS_PER_MINUTE,
  TTS_CHARACTERS_PER_CREDIT,
} from '@/constants/pricing';

export const PRICING_RULES = [
  {
    id: 'tts',
    feature: 'Text to Speech',
    unit: `per ${TTS_CHARACTERS_PER_CREDIT} characters`,
    credits: 1,
    providerCost: 0.0027,
    costUnit: `${TTS_CHARACTERS_PER_CREDIT} chars`,
  },
  {
    id: 'stt',
    feature: 'Speech to Text',
    unit: 'per minute',
    credits: CREDITS_PER_MINUTE.speechToText,
    providerCost: 0.0045,
    costUnit: 'min',
  },
  {
    id: 'realtime',
    feature: 'Real-time conversation',
    unit: 'per minute',
    credits: CREDITS_PER_MINUTE.realtime,
    providerCost: 0.03,
    costUnit: 'min',
  },
  {
    id: 'agents',
    feature: 'Voice agents',
    unit: 'per minute',
    credits: CREDITS_PER_MINUTE.realtime,
    providerCost: 0.031,
    costUnit: 'min',
  },
  {
    id: 'transformation',
    feature: 'Voice transformation',
    unit: 'per minute',
    credits: CREDITS_PER_MINUTE.voiceTransformation,
    providerCost: 0.0165,
    costUnit: 'min',
  },
  {
    id: 'enhancement',
    feature: 'Audio enhancement',
    unit: 'per minute',
    credits: CREDITS_PER_MINUTE.enhancement,
    providerCost: 0.0035,
    costUnit: 'min',
  },
];
