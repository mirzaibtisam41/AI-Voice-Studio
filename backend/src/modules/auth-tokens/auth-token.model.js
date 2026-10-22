import mongoose from 'mongoose';
import { SCHEMA_OPTIONS } from '#src/database/schema-options.js';
import { AUTH_TOKEN_TYPES } from '#src/modules/auth-tokens/auth-token.constants.js';

const authTokenSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: { type: String, enum: AUTH_TOKEN_TYPES, required: true },
    tokenHash: { type: String, required: true, select: false },
    expiresAt: { type: Date, required: true },
    usedAt: { type: Date, default: null },
  },
  SCHEMA_OPTIONS,
);

authTokenSchema.index(
  { tokenHash: 1 },
  { unique: true, name: 'auth_tokens_token_hash_unique' },
);
authTokenSchema.index({ userId: 1, type: 1 });

export const AuthTokenModel = mongoose.model(
  'AuthToken',
  authTokenSchema,
  'auth_tokens',
);
