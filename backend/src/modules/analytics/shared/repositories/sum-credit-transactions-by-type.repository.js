import { CreditTransactionModel } from '#src/modules/credit-transactions/credit-transaction.model.js';

export function sumCreditTransactionsByTypeRepository({ since, todayStart }) {
  return CreditTransactionModel.aggregate([
    { $match: { createdAt: { $gte: since } } },
    {
      $group: {
        _id: '$type',
        total: { $sum: '$amount' },
        today: {
          $sum: {
            $cond: [{ $gte: ['$createdAt', todayStart] }, '$amount', 0],
          },
        },
      },
    },
  ]);
}
