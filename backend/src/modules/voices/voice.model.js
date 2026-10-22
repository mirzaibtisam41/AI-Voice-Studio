import mongoose from 'mongoose';
import { SCHEMA_OPTIONS } from '#src/database/schema-options.js';
import {
  VOICE_ACCENT_MAX_LENGTH,
  VOICE_DESCRIPTION_MAX_LENGTH,
  VOICE_GENDER,
  VOICE_GENDERS,
  VOICE_NAME_MAX_LENGTH,
} from '#src/modules/voices/voice.constants.js';

const voiceSchema = new mongoose.Schema(
  {
    providerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AiProvider',
      required: true,
    },
    code: { type: String, required: true, trim: true, lowercase: true },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: VOICE_NAME_MAX_LENGTH,
    },
    accent: {
      type: String,
      default: 'American',
      maxlength: VOICE_ACCENT_MAX_LENGTH,
    },
    gender: {
      type: String,
      enum: VOICE_GENDERS,
      default: VOICE_GENDER.NEUTRAL,
    },
    tags: { type: [String], default: [] },
    description: {
      type: String,
      default: null,
      maxlength: VOICE_DESCRIPTION_MAX_LENGTH,
    },
    enabled: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
    previewStorageKey: { type: String, default: null },
  },
  SCHEMA_OPTIONS,
);

voiceSchema.index(
  { providerId: 1, code: 1 },
  { unique: true, name: 'voices_provider_code_unique' },
);

export const VoiceModel = mongoose.model('Voice', voiceSchema, 'voices');
