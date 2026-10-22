import { objectIdParamsSchema } from '#src/shared/schemas/index.js';
import { TRANSCRIPT_LINE_ROLES } from '#src/modules/generations/generation.constants.js';
import {
  AGENT_CHAT_MESSAGE_MAX_LENGTH,
  AGENT_CHAT_MESSAGES_HARD_MAX,
} from '#src/modules/agents/agent.constants.js';

export const chatWithAgentSchema = {
  params: objectIdParamsSchema('id'),
  body: {
    type: 'object',
    required: ['messages'],
    properties: {
      messages: {
        type: 'array',
        minItems: 1,
        maxItems: AGENT_CHAT_MESSAGES_HARD_MAX,
        items: {
          type: 'object',
          required: ['role', 'content'],
          properties: {
            role: { type: 'string', enum: TRANSCRIPT_LINE_ROLES },
            content: {
              type: 'string',
              minLength: 1,
              maxLength: AGENT_CHAT_MESSAGE_MAX_LENGTH,
              pattern: '\\S',
            },
          },
          additionalProperties: false,
        },
      },
    },
    additionalProperties: false,
  },
};
