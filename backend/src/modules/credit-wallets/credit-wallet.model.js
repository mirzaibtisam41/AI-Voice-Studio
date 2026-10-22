import mongoose from 'mongoose';
import { SCHEMA_OPTIONS } from '#src/database/schema-options.js';

const creditWalletSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    balance: { type: Number, required: true, default: 0, min: 0 },
  },
  SCHEMA_OPTIONS,
);

creditWalletSchema.index(
  { userId: 1 },
  { unique: true, name: 'credit_wallets_user_unique' },
);

export const CreditWalletModel = mongoose.model(
  'CreditWallet',
  creditWalletSchema,
  'credit_wallets',
);
