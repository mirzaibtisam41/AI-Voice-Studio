import { CreditTransactionModel } from '#src/modules/credit-transactions/credit-transaction.model.js';
import { CREDIT_TRANSACTION_TYPE } from '#src/modules/credit-transactions/credit-transaction.constants.js';

export function sumUserRefundsRepository({ userId, since, timezone }) {
  return CreditTransactionModel.aggregate([
    {
      $match: {
        userId,
        type: CREDIT_TRANSACTION_TYPE.USAGE_REFUND,
        createdAt: { $gte: since },
      },
    },
    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m-%d', date: '$createdAt', timezone },
        },
        credits: { $sum: '$amount' },
      },
    },
    { $project: { _id: 0, day: '$_id', credits: 1 } },
  ]);
}
