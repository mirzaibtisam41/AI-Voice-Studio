import { AI_CAPABILITIES, CAPABILITY_DETAILS } from '#src/constants/index.js';
import { CREDIT_TRANSACTION_TYPE } from '#src/modules/credit-transactions/credit-transaction.constants.js';
import {
  ANALYTICS_FAILED_JOBS_LIMIT,
  ANALYTICS_RECENT_DAYS,
  ANALYTICS_WEEKS,
} from '#src/modules/analytics/analytics.constants.js';
import {
  countGenerationsRepository,
  countUsersRepository,
  countWeeklyGenerationsRepository,
  listRecentFailedGenerationsRepository,
  sumCreditTransactionsByTypeRepository,
  sumUsageByCapabilityRepository,
} from '#src/modules/analytics/shared/repositories/index.js';

const DAY_MILLISECONDS = 24 * 60 * 60 * 1000;

function buildDates({ now }) {
  const todayStart = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );
  const daysSinceMonday = (todayStart.getUTCDay() + 6) % 7;
  const weekStart = new Date(
    todayStart.getTime() - daysSinceMonday * DAY_MILLISECONDS,
  );

  return {
    todayStart,
    last7Days: new Date(now.getTime() - 7 * DAY_MILLISECONDS),
    last30Days: new Date(
      now.getTime() - ANALYTICS_RECENT_DAYS * DAY_MILLISECONDS,
    ),
    monthStart: new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)),
    firstWeekStart: new Date(
      weekStart.getTime() - (ANALYTICS_WEEKS - 1) * 7 * DAY_MILLISECONDS,
    ),
  };
}

function toDateKey(date) {
  return date.toISOString().slice(0, 10);
}

function buildCredits({ sums }) {
  const byType = Object.fromEntries(sums.map((item) => [item._id, item]));
  const pick = (type, field) => byType[type]?.[field] ?? 0;
  const used = (field) =>
    -(
      pick(CREDIT_TRANSACTION_TYPE.USAGE_HOLD, field) +
      pick(CREDIT_TRANSACTION_TYPE.USAGE_REFUND, field)
    );

  return {
    usedToday: Math.max(used('today'), 0),
    usedLast30Days: Math.max(used('total'), 0),
    grantedLast30Days:
      pick(CREDIT_TRANSACTION_TYPE.SIGNUP_GRANT, 'total') +
      pick(CREDIT_TRANSACTION_TYPE.ADMIN_CREDIT, 'total'),
  };
}

function buildUsageByCapability({ usage }) {
  const byCapability = Object.fromEntries(
    usage.map((item) => [item._id, item]),
  );

  return AI_CAPABILITIES.map((capability) => ({
    capability,
    label: CAPABILITY_DETAILS[capability].label,
    credits: byCapability[capability]?.credits ?? 0,
    runs: byCapability[capability]?.runs ?? 0,
  }));
}

function buildWeeklyRequests({ weeks, firstWeekStart }) {
  const counts = Object.fromEntries(
    weeks.map((item) => [toDateKey(item._id), item.count]),
  );

  return Array.from({ length: ANALYTICS_WEEKS }, (_value, index) => {
    const weekStart = toDateKey(
      new Date(firstWeekStart.getTime() + index * 7 * DAY_MILLISECONDS),
    );

    return { weekStart, count: counts[weekStart] ?? 0 };
  });
}

function buildFailedJobs({ generations }) {
  return generations.map((generation) => ({
    id: generation._id.toString(),
    userEmail: generation.userId?.email ?? null,
    capability: generation.capability,
    errorCategory: generation.errorCategory,
    createdAt: generation.createdAt,
  }));
}

export async function getAnalyticsOverviewService({ now = new Date() } = {}) {
  const dates = buildDates({ now });

  const [
    totalUsers,
    activeUsers,
    newUsers,
    generationsToday,
    generationsLast7Days,
    sums,
    usage,
    weeks,
    failedGenerations,
  ] = await Promise.all([
    countUsersRepository(),
    countUsersRepository({ lastLoginSince: dates.last30Days }),
    countUsersRepository({ createdSince: dates.monthStart }),
    countGenerationsRepository({ createdSince: dates.todayStart }),
    countGenerationsRepository({ createdSince: dates.last7Days }),
    sumCreditTransactionsByTypeRepository({
      since: dates.last30Days,
      todayStart: dates.todayStart,
    }),
    sumUsageByCapabilityRepository({ since: dates.last30Days }),
    countWeeklyGenerationsRepository({ since: dates.firstWeekStart }),
    listRecentFailedGenerationsRepository({
      limit: ANALYTICS_FAILED_JOBS_LIMIT,
    }),
  ]);

  return {
    users: {
      total: totalUsers,
      activeLast30Days: activeUsers,
      newThisMonth: newUsers,
    },
    generations: { today: generationsToday, last7Days: generationsLast7Days },
    credits: buildCredits({ sums }),
    usageByCapability: buildUsageByCapability({ usage }),
    weeklyRequests: buildWeeklyRequests({
      weeks,
      firstWeekStart: dates.firstWeekStart,
    }),
    failedJobs: buildFailedJobs({ generations: failedGenerations }),
  };
}
