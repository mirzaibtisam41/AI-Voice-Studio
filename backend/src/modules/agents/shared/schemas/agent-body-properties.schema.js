import {
  AGENT_DESCRIPTION_MAX_LENGTH,
  AGENT_GREETING_MAX_LENGTH,
  AGENT_INSTRUCTIONS_MAX_LENGTH,
  AGENT_INSTRUCTIONS_MIN_LENGTH,
  AGENT_KNOWLEDGE_MAX_LENGTH,
  AGENT_NAME_MAX_LENGTH,
  AGENT_RESPONSE_STYLES,
  AGENT_STATUSES,
  AGENT_TOOLS,
} from '#src/modules/agents/agent.constants.js';

export const agentBodyProperties = {
  name: {
    type: 'string',
    minLength: 1,
    maxLength: AGENT_NAME_MAX_LENGTH,
    pattern: '\\S',
  },
  description: { type: 'string', maxLength: AGENT_DESCRIPTION_MAX_LENGTH },
  voiceCode: {
    type: 'string',
    minLength: 1,
    maxLength: 60,
    pattern: '^[A-Za-z0-9_-]+$',
  },
  greeting: { type: 'string', maxLength: AGENT_GREETING_MAX_LENGTH },
  instructions: {
    type: 'string',
    minLength: AGENT_INSTRUCTIONS_MIN_LENGTH,
    maxLength: AGENT_INSTRUCTIONS_MAX_LENGTH,
  },
  responseStyle: { type: 'string', enum: AGENT_RESPONSE_STYLES },
  tools: {
    type: 'array',
    maxItems: AGENT_TOOLS.length,
    uniqueItems: true,
    items: { type: 'string', enum: AGENT_TOOLS },
  },
  knowledge: { type: 'string', maxLength: AGENT_KNOWLEDGE_MAX_LENGTH },
  status: { type: 'string', enum: AGENT_STATUSES },
};
