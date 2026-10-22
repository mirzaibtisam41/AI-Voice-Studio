import mongoose from 'mongoose';
import {
  SCHEMA_OPTIONS,
  SUBDOCUMENT_OPTIONS,
} from '#src/database/schema-options.js';
import {
  AUDIO_FORMATS,
  AUDIO_FORMAT,
} from '#src/modules/audio-files/audio-file.constants.js';

const notificationsSchema = new mongoose.Schema(
  {
    generationFinished: { type: Boolean, default: true },
    lowCredits: { type: Boolean, default: true },
    lowCreditsThreshold: { type: Number, default: 10, min: 0 },
    weeklySummary: { type: Boolean, default: false },
    productUpdates: { type: Boolean, default: false },
  },
  SUBDOCUMENT_OPTIONS,
);

const userSettingsSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    defaultVoiceCode: { type: String, default: null },
    defaultFormat: {
      type: String,
      enum: AUDIO_FORMATS,
      default: AUDIO_FORMAT.MP3,
    },
    defaultLanguage: { type: String, default: 'en' },
    notifications: { type: notificationsSchema, default: () => ({}) },
  },
  SCHEMA_OPTIONS,
);

userSettingsSchema.index(
  { userId: 1 },
  { unique: true, name: 'user_settings_user_unique' },
);

export const UserSettingsModel = mongoose.model(
  'UserSettings',
  userSettingsSchema,
  'user_settings',
);
