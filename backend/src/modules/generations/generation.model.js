import mongoose from 'mongoose';
import {
  SCHEMA_OPTIONS,
  SUBDOCUMENT_OPTIONS,
} from '#src/database/schema-options.js';
import {
  AI_CAPABILITIES,
  PROVIDER_ERROR_CATEGORIES,
} from '#src/constants/index.js';
import {
  GENERATION_STATUS,
  GENERATION_STATUSES,
  TRANSCRIPT_LINE_ROLES,
} from '#src/modules/generations/generation.constants.js';

const inputSchema = new mongoose.Schema(
  {
    text: { type: String, default: null },
    characterCount: { type: Number, default: null },
    voiceCode: { type: String, default: null },
    format: { type: String, default: null },
    style: { type: String, default: null },
    instructions: { type: String, default: null },
    speed: { type: Number, default: null },
    language: { type: String, default: null },
    keywords: { type: [String], default: undefined },
    sourceAudioFileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AudioFile',
      default: null,
    },
    agentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Agent',
      default: null,
    },
    message: { type: String, default: null },
  },
  SUBDOCUMENT_OPTIONS,
);

const transcriptLineSchema = new mongoose.Schema(
  {
    role: { type: String, enum: TRANSCRIPT_LINE_ROLES, required: true },
    text: { type: String, required: true },
    at: { type: Number, default: null },
  },
  SUBDOCUMENT_OPTIONS,
);

const outputSchema = new mongoose.Schema(
  {
    audioFileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AudioFile',
      default: null,
    },
    durationSeconds: { type: Number, default: null },
    transcriptText: { type: String, default: null },
    editedTranscriptText: { type: String, default: null },
    languages: { type: [String], default: undefined },
    reply: { type: String, default: null },
    transcriptLines: { type: [transcriptLineSchema], default: undefined },
  },
  SUBDOCUMENT_OPTIONS,
);

const realtimeSchema = new mongoose.Schema(
  {
    startedAt: { type: Date, default: null },
    endedAt: { type: Date, default: null },
    allowedMinutes: { type: Number, default: null },
    expiresAt: { type: Date, default: null },
  },
  SUBDOCUMENT_OPTIONS,
);

const generationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    capability: { type: String, enum: AI_CAPABILITIES, required: true },
    status: {
      type: String,
      enum: GENERATION_STATUSES,
      default: GENERATION_STATUS.PROCESSING,
    },
    modelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AiModel',
      required: true,
    },
    providerModelId: { type: String, required: true },
    creditsPerUnit: { type: Number, required: true, min: 0 },
    units: { type: Number, default: 0, min: 0 },
    creditsHeld: { type: Number, default: 0, min: 0 },
    creditsCharged: { type: Number, default: 0, min: 0 },
    creditsRefunded: { type: Number, default: 0, min: 0 },
    input: { type: inputSchema, default: () => ({}) },
    output: { type: outputSchema, default: () => ({}) },
    realtime: { type: realtimeSchema, default: undefined },
    errorCategory: {
      type: String,
      enum: [...PROVIDER_ERROR_CATEGORIES, null],
      default: null,
    },
    completedAt: { type: Date, default: null },
    failedAt: { type: Date, default: null },
  },
  SCHEMA_OPTIONS,
);

generationSchema.index({ userId: 1, createdAt: -1 });
generationSchema.index({ userId: 1, capability: 1, createdAt: -1 });
generationSchema.index({ status: 1, createdAt: 1 });
generationSchema.index({ 'input.agentId': 1, createdAt: -1 });
generationSchema.index({ createdAt: -1 });

export const GenerationModel = mongoose.model(
  'Generation',
  generationSchema,
  'generations',
);
