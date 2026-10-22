import { CreditWalletModel } from '#src/modules/credit-wallets/credit-wallet.model.js';
import { UserModel } from '#src/modules/users/user.model.js';
import { USER_LIST_SORT } from '#src/modules/users/user.constants.js';

const SORT_STAGES = {
  [USER_LIST_SORT.NEWEST]: { createdAt: -1, _id: -1 },
  [USER_LIST_SORT.OLDEST]: { createdAt: 1, _id: 1 },
  [USER_LIST_SORT.BALANCE]: { balance: -1, createdAt: -1, _id: -1 },
};

function buildBalanceStages() {
  return [
    {
      $lookup: {
        from: CreditWalletModel.collection.name,
        localField: '_id',
        foreignField: 'userId',
        as: 'wallet',
      },
    },
    {
      $addFields: {
        balance: {
          $ifNull: [{ $arrayElemAt: ['$wallet.balance', 0] }, 0],
        },
      },
    },
    { $project: { wallet: 0, passwordHash: 0 } },
  ];
}

function buildPageStages({ sort, skip, limit }) {
  const pageStages = [
    { $sort: SORT_STAGES[sort] },
    { $skip: skip },
    { $limit: limit },
  ];

  if (sort === USER_LIST_SORT.BALANCE) {
    return [...buildBalanceStages(), ...pageStages];
  }

  return [...pageStages, ...buildBalanceStages()];
}

export async function listUsersRepository({ filter, sort, skip, limit }) {
  const [result] = await UserModel.aggregate([
    { $match: filter },
    {
      $facet: {
        users: buildPageStages({ sort, skip, limit }),
        total: [{ $count: 'count' }],
      },
    },
  ]);

  return { users: result.users, total: result.total[0]?.count ?? 0 };
}
