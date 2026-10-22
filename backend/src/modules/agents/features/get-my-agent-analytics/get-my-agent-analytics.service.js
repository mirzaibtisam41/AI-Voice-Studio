import { AI_CAPABILITY } from '#src/constants/index.js';
import { listAgentGenerationsRepository } from '#src/modules/agents/shared/repositories/index.js';
import { findMyAgentService } from '#src/modules/agents/shared/services/index.js';

const DAY_MS = 24 * 60 * 60 * 1000;

function startOfUtcDay({ date }) {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
}

function toDateKey({ date }) {
  return date.toISOString().slice(0, 10);
}

function buildDailyRows({ since, days }) {
  return Array.from({ length: days }, (_value, index) => ({
    date: toDateKey({ date: new Date(since.getTime() + index * DAY_MS) }),
    sessions: 0,
    chats: 0,
  }));
}

export async function getMyAgentAnalyticsService({
  userId,
  agentId,
  days,
  now = new Date(),
}) {
  const agent = await findMyAgentService({ userId, agentId });
  const since = new Date(
    startOfUtcDay({ date: now }).getTime() - (days - 1) * DAY_MS,
  );

  const generations = await listAgentGenerationsRepository({
    userId,
    agentId: agent._id,
    capabilities: [AI_CAPABILITY.VOICE_AGENT, AI_CAPABILITY.AGENT_CHAT],
    since,
  });

  const daily = buildDailyRows({ since, days });
  const dailyByDate = new Map(daily.map((row) => [row.date, row]));
  const totals = {
    sessions: 0,
    chats: 0,
    seconds: 0,
    timedSessions: 0,
    credits: 0,
  };

  for (const generation of generations) {
    const row = dailyByDate.get(toDateKey({ date: generation.createdAt }));

    totals.credits += generation.creditsCharged ?? 0;

    if (generation.capability === AI_CAPABILITY.AGENT_CHAT) {
      totals.chats += 1;
      if (row) row.chats += 1;
      continue;
    }

    totals.sessions += 1;
    if (row) row.sessions += 1;

    const seconds = generation.output?.durationSeconds;

    if (typeof seconds === 'number') {
      totals.seconds += seconds;
      totals.timedSessions += 1;
    }
  }

  return {
    days,
    sessions: totals.sessions,
    chats: totals.chats,
    totalMinutes: Math.round((totals.seconds / 60) * 10) / 10,
    avgDurationSeconds:
      totals.timedSessions > 0
        ? Math.round(totals.seconds / totals.timedSessions)
        : 0,
    creditsUsed: totals.credits,
    daily,
  };
}
