export const AUDIT_ACTION = {
  PROVIDER_CREATED: 'provider.created',
  PROVIDER_UPDATED: 'provider.updated',
  PROVIDER_STATUS_CHANGED: 'provider.status_changed',
  PROVIDER_DELETED: 'provider.deleted',
  MODEL_CREATED: 'model.created',
  MODEL_UPDATED: 'model.updated',
  MODEL_STATUS_CHANGED: 'model.status_changed',
  MODEL_CAPABILITY_UPDATED: 'model.capability_updated',
  MODEL_DEFAULT_CHANGED: 'model.default_changed',
  VOICE_UPDATED: 'voice.updated',
  SETTINGS_UPDATED: 'settings.updated',
  USER_STATUS_CHANGED: 'user.status_changed',
  USER_ROLE_CHANGED: 'user.role_changed',
  WALLET_ADJUSTED: 'wallet.adjusted',
  GENERATION_REFUNDED: 'generation.refunded',
};

export const AUDIT_ACTIONS = Object.values(AUDIT_ACTION);

export const AUDIT_TARGET_TYPE = {
  PROVIDER: 'provider',
  MODEL: 'model',
  VOICE: 'voice',
  SETTINGS: 'settings',
  USER: 'user',
  GENERATION: 'generation',
};

export const AUDIT_TARGET_TYPES = Object.values(AUDIT_TARGET_TYPE);
