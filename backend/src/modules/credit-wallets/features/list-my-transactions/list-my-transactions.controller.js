import { listMyTransactionsService } from '#src/modules/credit-wallets/features/list-my-transactions/list-my-transactions.service.js';

export async function listMyTransactionsController(request, reply) {
  const { transactions, meta } = await listMyTransactionsService({
    userId: request.user._id,
    query: request.query,
  });

  return reply.success({ data: { transactions }, meta });
}
