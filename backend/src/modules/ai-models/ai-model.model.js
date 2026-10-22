import mongoose from 'mongoose';
import {
  SCHEMA_OPTIONS,
  SUBDOCUMENT_OPTIONS,
} from '#src/database/schema-options.js';
import { AI_CAPABILITIES } from '#src/constants/index.js';
import {
  AI_MODEL_CREDITS_PER_UNIT_MAX,
  AI_MODEL_NAME_MAX_LENGTH,
  AI_MODEL_PROVIDER_MODEL_ID_MAX_LENGTH,
  AI_MODEL_SLUG_MAX_LENGTH,
  AI_MODEL_STATUS,
  AI_MODEL_STATUSES,
} from '#src/modules/ai-models/ai-model.constants.js';

const capabilitySchema = new mongoose.Schema(
  {
    code: { type: String, enum: AI_CAPABILITIES, required: true },
    enabled: { type: Boolean, default: false },
    creditsPerUnit: {
      type: Number,
      default: null,
      min: 1,
      max: AI_MODEL_CREDITS_PER_UNIT_MAX,
    },
    isDefault: { type: Boolean, default: false },
  },
  SUBDOCUMENT_OPTIONS,
);

const aiModelSchema = new mongoose.Schema(
  {
    providerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AiProvider',
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: AI_MODEL_NAME_MAX_LENGTH,
    },
    slug: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: AI_MODEL_SLUG_MAX_LENGTH,
    },
    providerModelId: {
      type: String,
      required: true,
      trim: true,
      maxlength: AI_MODEL_PROVIDER_MODEL_ID_MAX_LENGTH,
    },
    description: { type: String, default: null },
    status: {
      type: String,
      enum: AI_MODEL_STATUSES,
      default: AI_MODEL_STATUS.DRAFT,
    },
    capabilities: { type: [capabilitySchema], default: [] },
  },
  SCHEMA_OPTIONS,
);

aiModelSchema.index(
  { slug: 1 },
  { unique: true, name: 'ai_models_slug_unique' },
);
aiModelSchema.index({ providerId: 1 });
aiModelSchema.index({ status: 1, 'capabilities.code': 1 });

export const AiModelModel = mongoose.model(
  'AiModel',
  aiModelSchema,
  'ai_models',
);
