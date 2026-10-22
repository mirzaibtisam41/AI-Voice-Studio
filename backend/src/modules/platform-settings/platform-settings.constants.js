export const PLATFORM_SETTINGS_KEY = 'global';

export const PLATFORM_SETTINGS_DEFAULTS = {
  signupCredits: 50,
  requireEmailVerification: false,
  ttsMaxCharacters: 5000,
  uploadMaxMegabytes: 25,
  realtimeMaxMinutes: 10,
  agentChatMaxMessages: 20,
  maintenanceMode: false,
  maintenanceMessage: '',
};

export const PLATFORM_SETTINGS_LIMITS = {
  signupCredits: { min: 0, max: 100000 },
  ttsMaxCharacters: { min: 100, max: 20000 },
  uploadMaxMegabytes: { min: 1, max: 25 },
  realtimeMaxMinutes: { min: 1, max: 60 },
  agentChatMaxMessages: { min: 1, max: 100 },
  maintenanceMessageMaxLength: 300,
};
