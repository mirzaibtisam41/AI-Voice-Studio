import { TRANSACTIONS_EXPORT_FILE_NAME } from '#src/modules/credit-wallets/credit-wallet.constants.js';
import { exportMyTransactionsService } from '#src/modules/credit-wallets/features/export-my-transactions/export-my-transactions.service.js';

export async function exportMyTransactionsController(request, reply) {
  const csv = await exportMyTransactionsService({
    userId: request.user._id,
    query: request.query,
  });

  return reply
    .header('content-type', 'text/csv; charset=utf-8')
    .header(
      'content-disposition',
      `attachment; filename="${TRANSACTIONS_EXPORT_FILE_NAME}"`,
    )
    .header('cache-control', 'no-store')
    .send(csv);
}
