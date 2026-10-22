import { PROVIDER_ERROR_CATEGORY } from '#src/constants/index.js';
import { BadRequestError, ConflictError } from '#src/utils/index.js';
import { findCreditWalletByUserIdRepository } from '#src/modules/credit-wallets/shared/repositories/index.js';
import { GENERATION_STATUS } from '#src/modules/generations/generation.constants.js';
import { failGenerationService } from '#src/modules/generations/shared/services/index.js';
import { REALTIME_CANCEL_WINDOW_SECONDS } from '#src/modules/realtime/realtime.constants.js';
import { findMyRealtimeSessionService } from '#src/modules/realtime/shared/services/index.js';
import { presentRealtimeSessionUtil } from '#src/modules/realtime/shared/utils/index.js';

function ensureCancellable({ session, now }) {
  if (session.status !== GENERATION_STATUS.PROCESSING) {
    throw new ConflictError('This conversation has already ended');
  }

  const startedAt = session.realtime?.startedAt ?? session.createdAt;

  if (now - startedAt > REALTIME_CANCEL_WINDOW_SECONDS * 1000) {
    throw new BadRequestError(
      'This conversation can no longer be cancelled. End it instead',
    );
  }

  if ((session.output?.transcriptLines ?? []).length > 0) {
    throw new BadRequestError(
      'This conversation already has a transcript. End it instead',
    );
  }
}

async function buildResult({ userId, session, refundedCredits }) {
  const wallet = await findCreditWalletByUserIdRepository({ userId });

  return {
    session: presentRealtimeSessionUtil({ session }),
    refundedCredits,
    balance: wallet.balance,
  };
}

export async function cancelRealtimeSessionService({
  userId,
  sessionId,
  now = new Date(),
}) {
  const session = await findMyRealtimeSessionService({ userId, sessionId });

  if (
    session.status === GENERATION_STATUS.FAILED &&
    session.errorCategory === PROVIDER_ERROR_CATEGORY.PROVIDER_UNAVAILABLE
  ) {
    return buildResult({
      userId,
      session,
      refundedCredits: session.creditsRefunded,
    });
  }

  ensureCancellable({ session, now });

  const { generation, refundedCredits } = await failGenerationService({
    generationId: session._id,
    errorCategory: PROVIDER_ERROR_CATEGORY.PROVIDER_UNAVAILABLE,
    reason: 'Refund for a session that could not connect',
  });

  return buildResult({ userId, session: generation, refundedCredits });
}
