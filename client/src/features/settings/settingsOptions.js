export const OUTPUT_FORMATS = [
  { value: 'mp3-128', label: 'MP3 128 kbps' },
  { value: 'mp3-192', label: 'MP3 192 kbps' },
  { value: 'wav', label: 'WAV' },
  { value: 'opus', label: 'Opus' },
];

export const LANGUAGES = [
  { value: 'en-US', label: 'English (US)' },
  { value: 'en-GB', label: 'English (UK)' },
  { value: 'es', label: 'Spanish' },
  { value: 'fr', label: 'French' },
  { value: 'de', label: 'German' },
  { value: 'ar', label: 'Arabic' },
  { value: 'hi', label: 'Hindi' },
  { value: 'ja', label: 'Japanese' },
];

export const THEME_OPTIONS = [
  { value: 'dark', label: 'Dark' },
  { value: 'light', label: 'Light' },
  { value: 'system', label: 'System' },
];

export const ACTIVE_SESSIONS = [
  {
    id: 'session_current',
    device: 'Chrome on Windows',
    location: 'Dubai, UAE',
    lastActive: 'Active now',
    kind: 'desktop',
    current: true,
  },
  {
    id: 'session_iphone',
    device: 'Safari on iPhone',
    location: 'Dubai, UAE',
    lastActive: '2 hours ago',
    kind: 'mobile',
  },
  {
    id: 'session_mac',
    device: 'Firefox on macOS',
    location: 'Abu Dhabi, UAE',
    lastActive: 'Oct 18, 4:20 PM',
    kind: 'desktop',
  },
];

export const DEFAULT_PREFERENCES = {
  voiceId: 'marin',
  outputFormat: 'mp3-128',
  language: 'en-US',
};

export const DEFAULT_NOTIFICATIONS = {
  generationFinished: true,
  lowBalance: true,
  lowBalanceThreshold: 20000,
  weeklySummary: false,
  productUpdates: true,
  securityAlerts: true,
};

const PREFERENCES_KEY = 'avs-preferences';
const NOTIFICATIONS_KEY = 'avs-notifications';

function readStored(key, fallback) {
  try {
    const saved = window.localStorage.getItem(key);

    return saved ? { ...fallback, ...JSON.parse(saved) } : fallback;
  } catch {
    return fallback;
  }
}

function writeStored(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    return;
  }
}

export function readPreferences() {
  return readStored(PREFERENCES_KEY, DEFAULT_PREFERENCES);
}

export function savePreferences(preferences) {
  writeStored(PREFERENCES_KEY, preferences);
}

export function readNotifications() {
  return readStored(NOTIFICATIONS_KEY, DEFAULT_NOTIFICATIONS);
}

export function saveNotifications(notifications) {
  writeStored(NOTIFICATIONS_KEY, notifications);
}
