import { GenerationModel } from '#src/modules/generations/generation.model.js';

const USER_LOOKUP = [
  {
    $lookup: {
      from: 'users',
      localField: 'userId',
      foreignField: '_id',
      pipeline: [{ $project: { name: 1, email: 1 } }],
      as: 'user',
    },
  },
  { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
];

export async function listAdminGenerationsRepository({
  filter,
  emailPattern,
  skip,
  limit,
}) {
  const searchStages = emailPattern
    ? [
        ...USER_LOOKUP,
        { $match: { 'user.email': { $regex: emailPattern, $options: 'i' } } },
      ]
    : [];

  const [result] = await GenerationModel.aggregate([
    { $match: filter },
    ...searchStages,
    { $sort: { createdAt: -1, _id: -1 } },
    {
      $facet: {
        items: [
          { $skip: skip },
          { $limit: limit },
          ...(emailPattern ? [] : USER_LOOKUP),
        ],
        total: [{ $count: 'value' }],
      },
    },
  ]);

  return { generations: result.items, total: result.total[0]?.value ?? 0 };
}
