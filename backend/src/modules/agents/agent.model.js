import mongoose from 'mongoose';
import { SCHEMA_OPTIONS } from '#src/database/schema-options.js';
import {
  AGENT_DESCRIPTION_MAX_LENGTH,
  AGENT_GREETING_MAX_LENGTH,
  AGENT_INSTRUCTIONS_MAX_LENGTH,
  AGENT_KNOWLEDGE_MAX_LENGTH,
  AGENT_NAME_MAX_LENGTH,
  AGENT_RESPONSE_STYLE,
  AGENT_RESPONSE_STYLES,
  AGENT_STATUS,
  AGENT_STATUSES,
  AGENT_TOOLS,
} from '#src/modules/agents/agent.constants.js';

const agentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: AGENT_NAME_MAX_LENGTH,
    },
    description: {
      type: String,
      default: null,
      maxlength: AGENT_DESCRIPTION_MAX_LENGTH,
    },
    voiceCode: { type: String, required: true },
    greeting: {
      type: String,
      default: null,
      maxlength: AGENT_GREETING_MAX_LENGTH,
    },
    instructions: {
      type: String,
      required: true,
      maxlength: AGENT_INSTRUCTIONS_MAX_LENGTH,
    },
    responseStyle: {
      type: String,
      enum: AGENT_RESPONSE_STYLES,
      default: AGENT_RESPONSE_STYLE.BALANCED,
    },
    tools: { type: [{ type: String, enum: AGENT_TOOLS }], default: [] },
    knowledge: {
      type: String,
      default: null,
      maxlength: AGENT_KNOWLEDGE_MAX_LENGTH,
    },
    status: {
      type: String,
      enum: AGENT_STATUSES,
      default: AGENT_STATUS.DRAFT,
    },
  },
  SCHEMA_OPTIONS,
);

agentSchema.index({ userId: 1, createdAt: -1 });

export const AgentModel = mongoose.model('Agent', agentSchema, 'agents');
