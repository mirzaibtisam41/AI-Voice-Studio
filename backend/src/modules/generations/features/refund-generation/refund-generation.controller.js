import { refundGenerationService } from '#src/modules/generations/features/refund-generation/refund-generation.service.js';

export async function refundGenerationController(request, reply) {
  const { generation, refundedCredits, balance } =
    await refundGenerationService({
      actor: request.user,
      generationId: request.params.id,
      reason: request.body.reason,
    });

  return reply.success({
    data: { generation, refundedCredits, balance },
    message: `${refundedCredits} credits refunded`,
  });
}
