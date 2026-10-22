import { CreditTransactionModel } from '#src/modules/credit-transactions/credit-transaction.model.js';
import { ADMIN_ADJUSTMENT_TYPES } from '#src/modules/credit-transactions/credit-transaction.constants.js';

export function listCreditAdjustmentsRepository({ skip, limit }) {
  return CreditTransactionModel.find({ type: { $in: ADMIN_ADJUSTMENT_TYPES } })
    .select('userId amount balanceAfter type reason createdBy createdAt')
    .sort({ createdAt: -1, _id: -1 })
    .skip(skip)
    .limit(limit)
    .populate('userId', 'name email')
    .populate('createdBy', 'name email');
}
