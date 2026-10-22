import mongoose from 'mongoose';
import { SCHEMA_OPTIONS } from '#src/database/schema-options.js';
import {
  AUDIT_ACTIONS,
  AUDIT_TARGET_TYPES,
} from '#src/modules/audit-logs/audit-log.constants.js';

const auditLogSchema = new mongoose.Schema(
  {
    actorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    actorEmail: { type: String, default: 'system' },
    action: { type: String, enum: AUDIT_ACTIONS, required: true },
    targetType: { type: String, enum: AUDIT_TARGET_TYPES, required: true },
    targetId: { type: String, default: null },
    targetLabel: { type: String, default: null },
    details: { type: mongoose.Schema.Types.Mixed, default: null },
  },
  { ...SCHEMA_OPTIONS, timestamps: { createdAt: true, updatedAt: false } },
);

auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ action: 1, createdAt: -1 });
auditLogSchema.index({ actorId: 1, createdAt: -1 });

export const AuditLogModel = mongoose.model(
  'AuditLog',
  auditLogSchema,
  'audit_logs',
);
