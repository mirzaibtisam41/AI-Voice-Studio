export const CAPABILITY_COLORS = {
  text_to_speech: 'brand',
  speech_to_text: 'blue',
  realtime: 'teal',
  voice_agent: 'amber',
  agent_chat: 'success',
};

export const CAPABILITY_LABELS = {
  text_to_speech: 'Text to Speech',
  speech_to_text: 'Speech to Text',
  realtime: 'Real-time conversation',
  voice_agent: 'Voice agent session',
  agent_chat: 'Agent test chat',
};

export const TRANSACTION_TYPE_LABELS = {
  signup_grant: 'Signup bonus',
  admin_credit: 'Admin credit',
  admin_debit: 'Admin debit',
  usage_hold: 'Usage',
  usage_refund: 'Refund',
};

const PRICING_UNIT_LABELS = {
  per_100_characters: '100 characters',
  per_minute: 'minute',
  per_message: 'message',
};

export function formatRate({ creditsPerUnit, unit }) {
  const credits = `${creditsPerUnit.toLocaleString()} ${creditsPerUnit === 1 ? 'credit' : 'credits'}`;

  return `${credits} / ${PRICING_UNIT_LABELS[unit] ?? unit}`;
}

export function transactionFeature(transaction) {
  if (transaction.capability) {
    return CAPABILITY_LABELS[transaction.capability] ?? transaction.capability;
  }

  return TRANSACTION_TYPE_LABELS[transaction.type] ?? transaction.type;
}
