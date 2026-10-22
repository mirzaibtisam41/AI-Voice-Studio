import mongoose from 'mongoose';
import { SCHEMA_OPTIONS } from '#src/database/schema-options.js';
import {
  USER_EMAIL_MAX_LENGTH,
  USER_NAME_MAX_LENGTH,
  USER_ROLE,
  USER_ROLES,
  USER_STATUS,
  USER_STATUSES,
} from '#src/modules/users/user.constants.js';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: USER_NAME_MAX_LENGTH,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: USER_EMAIL_MAX_LENGTH,
    },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: USER_ROLES, default: USER_ROLE.USER },
    status: { type: String, enum: USER_STATUSES, default: USER_STATUS.ACTIVE },
    emailVerifiedAt: { type: Date, default: null },
    lastLoginAt: { type: Date, default: null },
  },
  SCHEMA_OPTIONS,
);

userSchema.index({ email: 1 }, { unique: true, name: 'users_email_unique' });

export const UserModel = mongoose.model('User', userSchema, 'users');
