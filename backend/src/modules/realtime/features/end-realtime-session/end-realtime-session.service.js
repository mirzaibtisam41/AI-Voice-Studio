import { CAPABILITY_DETAILS } from '#src/constants/index.js';
import { calculateCreditsUtil } from '#src/utils/index.js';
import { findCreditWalletByUserIdRepository } from '#src/modules/credit-wallets/shared/repositories/index.js';
import { GENERATION_STATUS } from '#src/modules/generations/generation.constants.js';
import { completeGenerationService } from '#src/modules/generations/shared/services/index.js';
import { findMyRealtimeSessionService } from '#src/modules/realtime/shared/services/index.js';
import { presentRealtimeSessionUtil } from '#src/modules/realtime/shared/utils/index.js';

function measureSeconds({ session, now }) {
  const startedAt = session.realtime?.startedAt ?? session.createdAt;
  const elapsed = Math.max(0, Math.ceil((now - startedAt) / 1000));
  const allowedSeconds = (session.realtime?.allowedMinutes ?? 0) * 60;

  return Math.min(elapsed, allowedSeconds);
}

async function settleSession({ session, transcript, now }) {
  const durationSeconds = measureSeconds({ session, now });
  const creditsCharged = calculateCreditsUtil({
    unit: CAPABILITY_DETAILS[session.capability].unit,
    creditsPerUnit: session.creditsPerUnit,
    quantity: Math.max(1, durationSeconds),
  });

  return completeGenerationService({
    generationId: session._id,
    creditsCharged,
    units: durationSeconds,
    output: {
      durationSeconds,
      transcriptLines: (transcript ?? []).map((line) => ({
        role: line.role,
        text: line.text.trim(),
        at: line.at ?? null,
      })),
    },
    realtime: { endedAt: now },
  });
}

export async function endRealtimeSessionService({
  userId,
  sessionId,
  data,
  now = new Date(),
}) {
  const session = await findMyRealtimeSessionService({ userId, sessionId });

  const settled =
    session.status === GENERATION_STATUS.PROCESSING
      ? await settleSession({ session, transcript: data?.transcript, now })
      : session;
  const wallet = await findCreditWalletByUserIdRepository({ userId });

  return {
    session: presentRealtimeSessionUtil({ session: settled }),
    creditsCharged: settled.creditsCharged,
    creditsRefunded: settled.creditsRefunded,
    balance: wallet.balance,
  };
}
