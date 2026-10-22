import mongoose from 'mongoose';
import { SCHEMA_OPTIONS } from '#src/database/schema-options.js';
import {
  AUDIO_FILE_KINDS,
  AUDIO_FILE_TITLE_MAX_LENGTH,
} from '#src/modules/audio-files/audio-file.constants.js';

const audioFileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    kind: { type: String, enum: AUDIO_FILE_KINDS, required: true },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: AUDIO_FILE_TITLE_MAX_LENGTH,
    },
    storageKey: { type: String, required: true },
    contentType: { type: String, required: true },
    format: { type: String, required: true },
    sizeBytes: { type: Number, required: true, min: 0 },
    durationSeconds: { type: Number, default: null, min: 0 },
    favorite: { type: Boolean, default: false },
    generationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Generation',
      default: null,
    },
    voiceCode: { type: String, default: null },
    hasTranscript: { type: Boolean, default: false },
  },
  SCHEMA_OPTIONS,
);

audioFileSchema.index({ userId: 1, createdAt: -1 });
audioFileSchema.index({ userId: 1, kind: 1 });
audioFileSchema.index({ userId: 1, title: 'text' });

export const AudioFileModel = mongoose.model(
  'AudioFile',
  audioFileSchema,
  'audio_files',
);
