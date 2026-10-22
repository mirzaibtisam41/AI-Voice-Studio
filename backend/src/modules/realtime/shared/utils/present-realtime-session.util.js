import { REALTIME_SESSION_KIND } from '#src/modules/realtime/realtime.constants.js';

export function presentRealtimeSessionUtil({
  session,
  includeTranscript = true,
}) {
  const transcript = session.output?.transcriptLines ?? [];
  const presented = {
    id: session._id.toString(),
    kind: REALTIME_SESSION_KIND[session.capability],
    capability: session.capability,
    status: session.status,
    agentId: session.input?.agentId?.toString() ?? null,
    model: session.providerModelId,
    voiceCode: session.input?.voiceCode ?? null,
    responseStyle: session.input?.style ?? null,
    instructions: session.input?.instructions ?? null,
    allowedMinutes: session.realtime?.allowedMinutes ?? null,
    creditsPerMinute: session.creditsPerUnit,
    creditsHeld: session.creditsHeld,
    creditsCharged: session.creditsCharged,
    creditsRefunded: session.creditsRefunded,
    startedAt: session.realtime?.startedAt ?? null,
    endedAt: session.realtime?.endedAt ?? null,
    expiresAt: session.realtime?.expiresAt ?? null,
    durationSeconds: session.output?.durationSeconds ?? null,
    turnCount: transcript.length,
    errorCategory: session.errorCategory,
    createdAt: session.createdAt,
  };

  if (includeTranscript) {
    presented.transcript = transcript.map((line) => ({
      role: line.role,
      text: line.text,
      at: line.at ?? null,
    }));
  }

  return presented;
}
