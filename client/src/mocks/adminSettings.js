export const PLATFORM_SETTINGS = {
  platformName: 'AI Voice Studio',
  supportEmail: 'support@aivoicestudio.app',
  signupCredits: 10000,
  requireEmailVerification: true,
  maxTtsCharacters: 5000,
  maxUploadMb: 25,
  realtimeSessionMinutes: 30,
  maintenanceMode: false,
  maintenanceMessage:
    'AI Voice Studio is getting an upgrade. We will be back in about 30 minutes.',
  defaultModels: {
    TTS: 'gpt-realtime-2.1-mini',
    STT: 'gpt-transcribe',
    Realtime: 'gpt-realtime-2.1-mini',
    Agents: 'gpt-realtime-2.1-mini',
    Chat: 'gpt-5-nano',
  },
};
