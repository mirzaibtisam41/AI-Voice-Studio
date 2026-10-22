import { StatusCodes } from 'http-status-codes';
import { adjustUserCreditsService } from '#src/modules/credit-wallets/features/adjust-user-credits/adjust-user-credits.service.js';

function buildMessage({ amount, isDuplicate }) {
  if (isDuplicate) return 'This adjustment was already applied';

  return amount > 0 ? 'Credits added' : 'Credits deducted';
}

export async function adjustUserCreditsController(request, reply) {
  const { transaction, balance, isDuplicate } = await adjustUserCreditsService({
    actor: request.user,
    userId: request.params.userId,
    amount: request.body.amount,
    reason: request.body.reason,
    idempotencyHeader: request.headers['idempotency-key'],
  });

  return reply.success({
    data: { transaction, balance },
    message: buildMessage({ amount: transaction.amount, isDuplicate }),
    statusCode: isDuplicate ? StatusCodes.OK : StatusCodes.CREATED,
  });
}
