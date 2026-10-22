import mongoose from 'mongoose';
import { SCHEMA_OPTIONS } from '#src/database/schema-options.js';
import { AI_CAPABILITIES } from '#src/constants/index.js';
import {
  CREDIT_IDEMPOTENCY_KEY_MAX_LENGTH,
  CREDIT_TRANSACTION_REASON_MAX_LENGTH,
  CREDIT_TRANSACTION_TYPES,
} from '#src/modules/credit-transactions/credit-transaction.constants.js';

const creditTransactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    walletId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CreditWallet',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      validate: {
        validator: (value) => Number.isInteger(value) && value !== 0,
        message: 'Amount must be a non-zero whole number',
      },
    },
    balanceAfter: { type: Number, required: true, min: 0 },
    type: { type: String, enum: CREDIT_TRANSACTION_TYPES, required: true },
    capability: {
      type: String,
      enum: [...AI_CAPABILITIES, null],
      default: null,
    },
    generationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Generation',
      default: null,
    },
    reason: {
      type: String,
      default: null,
      maxlength: CREDIT_TRANSACTION_REASON_MAX_LENGTH,
    },
    idempotencyKey: {
      type: String,
      default: undefined,
      maxlength: CREDIT_IDEMPOTENCY_KEY_MAX_LENGTH,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  { ...SCHEMA_OPTIONS, timestamps: { createdAt: true, updatedAt: false } },
);

creditTransactionSchema.index(
  { idempotencyKey: 1 },
  {
    unique: true,
    name: 'credit_transactions_idempotency_key_unique',
    partialFilterExpression: { idempotencyKey: { $type: 'string' } },
  },
);
creditTransactionSchema.index({ userId: 1, createdAt: -1 });
creditTransactionSchema.index({ generationId: 1 });

export const CreditTransactionModel = mongoose.model(
  'CreditTransaction',
  creditTransactionSchema,
  'credit_transactions',
);
