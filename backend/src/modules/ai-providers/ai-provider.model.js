import mongoose from 'mongoose';
import { SCHEMA_OPTIONS } from '#src/database/schema-options.js';
import {
  AI_PROVIDER_CODE_MAX_LENGTH,
  AI_PROVIDER_NAME_MAX_LENGTH,
  AI_PROVIDER_STATUS,
  AI_PROVIDER_STATUSES,
} from '#src/modules/ai-providers/ai-provider.constants.js';

const aiProviderSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: AI_PROVIDER_NAME_MAX_LENGTH,
    },
    code: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: AI_PROVIDER_CODE_MAX_LENGTH,
    },
    description: { type: String, default: null },
    status: {
      type: String,
      enum: AI_PROVIDER_STATUSES,
      default: AI_PROVIDER_STATUS.ACTIVE,
    },
  },
  SCHEMA_OPTIONS,
);

aiProviderSchema.index(
  { code: 1 },
  { unique: true, name: 'ai_providers_code_unique' },
);

export const AiProviderModel = mongoose.model(
  'AiProvider',
  aiProviderSchema,
  'ai_providers',
);
