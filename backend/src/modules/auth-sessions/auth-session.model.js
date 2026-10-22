import mongoose from 'mongoose';
import { SCHEMA_OPTIONS } from '#src/database/schema-options.js';

const authSessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    familyId: { type: String, required: true },
    refreshTokenHash: { type: String, required: true, select: false },
    replacedById: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AuthSession',
      default: null,
    },
    userAgent: { type: String, default: null },
    ipAddress: { type: String, default: null },
    expiresAt: { type: Date, required: true },
    lastUsedAt: { type: Date, default: null },
    revokedAt: { type: Date, default: null },
  },
  SCHEMA_OPTIONS,
);

authSessionSchema.index(
  { refreshTokenHash: 1 },
  { unique: true, name: 'auth_sessions_refresh_token_hash_unique' },
);
authSessionSchema.index({ userId: 1 });
authSessionSchema.index({ familyId: 1 });

export const AuthSessionModel = mongoose.model(
  'AuthSession',
  authSessionSchema,
  'auth_sessions',
);
