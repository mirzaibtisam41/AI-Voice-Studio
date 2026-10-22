export const AGENT_STATUS = {
  DRAFT: 'draft',
  LIVE: 'live',
  PAUSED: 'paused',
};

export const AGENT_STATUSES = Object.values(AGENT_STATUS);

export const AGENT_RESPONSE_STYLE = {
  CONCISE: 'concise',
  BALANCED: 'balanced',
  DETAILED: 'detailed',
};

export const AGENT_RESPONSE_STYLES = Object.values(AGENT_RESPONSE_STYLE);

export const AGENT_TOOL = {
  ORDER_STATUS: 'order_status',
  SUPPORT_TICKET: 'support_ticket',
  BOOK_MEETING: 'book_meeting',
  HELP_CENTER: 'help_center',
};

export const AGENT_TOOLS = Object.values(AGENT_TOOL);

export const AGENT_NAME_MAX_LENGTH = 80;
export const AGENT_DESCRIPTION_MAX_LENGTH = 300;
export const AGENT_GREETING_MAX_LENGTH = 300;
export const AGENT_INSTRUCTIONS_MIN_LENGTH = 20;
export const AGENT_INSTRUCTIONS_MAX_LENGTH = 4000;
export const AGENT_KNOWLEDGE_MAX_LENGTH = 8000;
export const AGENTS_PER_USER_MAX = 20;

export const AGENT_CHAT_MESSAGE_MAX_LENGTH = 2000;
export const AGENT_CHAT_MESSAGES_HARD_MAX = 100;
export const AGENT_ANALYTICS_DAYS = [7, 30];
export const AGENT_COPY_SUFFIX = ' (copy)';

export const AGENT_RESPONSE_STYLE_GUIDANCE = {
  [AGENT_RESPONSE_STYLE.CONCISE]:
    'Keep every answer short: one to three sentences.',
  [AGENT_RESPONSE_STYLE.BALANCED]:
    'Keep answers clear and reasonably short, adding detail only when it helps.',
  [AGENT_RESPONSE_STYLE.DETAILED]:
    'Give thorough answers that explain the reasoning and the next steps.',
};

export const AGENT_CHAT_STYLE_GUIDANCE = {
  [AGENT_RESPONSE_STYLE.CONCISE]: 'Reply in 1 to 3 short sentences.',
  [AGENT_RESPONSE_STYLE.BALANCED]: 'Reply in 2 to 5 sentences.',
  [AGENT_RESPONSE_STYLE.DETAILED]: 'Reply in up to 2 short paragraphs.',
};
