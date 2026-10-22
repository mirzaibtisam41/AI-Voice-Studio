export const GENERATION_STATUS = {
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
};

export const GENERATION_STATUSES = Object.values(GENERATION_STATUS);

export const STUCK_GENERATION_MINUTES = 15;

export const TRANSCRIPT_LINE_ROLE = {
  USER: 'user',
  ASSISTANT: 'assistant',
};

export const TRANSCRIPT_LINE_ROLES = Object.values(TRANSCRIPT_LINE_ROLE);

export const TRANSCRIPT_TEXT_MAX_LENGTH = 200000;
export const TRANSCRIPT_LINES_MAX = 500;
export const TRANSCRIPT_LINE_MAX_LENGTH = 4000;
