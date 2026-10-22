export const CREDIT_VALUE_USD = 0.00008;

export const SIGNUP_BONUS_CREDITS = 10000;

export const PRICING_RULES = [
  {
    id: 'tts',
    feature: 'Text to Speech',
    unit: 'per character',
    credits: 1,
    providerCost: 0.000015,
    costUnit: 'char',
  },
  {
    id: 'stt',
    feature: 'Speech to Text',
    unit: 'per minute',
    credits: 5,
    providerCost: 0.006,
    costUnit: 'min',
  },
  {
    id: 'realtime',
    feature: 'Real-time conversation',
    unit: 'per session minute',
    credits: 20,
    providerCost: 0.024,
    costUnit: 'min',
  },
  {
    id: 'agents',
    feature: 'Voice agents',
    unit: 'per session minute',
    credits: 24,
    providerCost: 0.026,
    costUnit: 'min',
  },
  {
    id: 'cloning',
    feature: 'Voice cloning',
    unit: 'per character',
    credits: 1.5,
    providerCost: 0.00003,
    costUnit: 'char',
  },
  {
    id: 'transformation',
    feature: 'Voice transformation',
    unit: 'per minute',
    credits: 12,
    providerCost: 0.021,
    costUnit: 'min',
  },
  {
    id: 'enhancement',
    feature: 'Audio enhancement',
    unit: 'per minute',
    credits: 8,
    providerCost: 0.004,
    costUnit: 'min',
  },
];

export const CREDIT_PACKAGES = [
  {
    id: 'pkg_s',
    name: 'Starter',
    size: 'S',
    credits: 50000,
    priceUsd: 5,
    popular: false,
    active: true,
  },
  {
    id: 'pkg_m',
    name: 'Creator',
    size: 'M',
    credits: 150000,
    priceUsd: 12,
    popular: true,
    active: true,
  },
  {
    id: 'pkg_l',
    name: 'Pro',
    size: 'L',
    credits: 500000,
    priceUsd: 36,
    popular: false,
    active: true,
  },
  {
    id: 'pkg_xl',
    name: 'Studio',
    size: 'XL',
    credits: 1500000,
    priceUsd: 99,
    popular: false,
    active: false,
  },
];
