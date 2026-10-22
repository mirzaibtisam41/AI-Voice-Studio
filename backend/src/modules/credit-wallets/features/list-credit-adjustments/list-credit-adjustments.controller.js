import { listCreditAdjustmentsService } from '#src/modules/credit-wallets/features/list-credit-adjustments/list-credit-adjustments.service.js';

export async function listCreditAdjustmentsController(request, reply) {
  const { adjustments, meta } = await listCreditAdjustmentsService({
    query: request.query,
  });

  return reply.success({ data: { adjustments }, meta });
}
