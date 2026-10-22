'use client';

import { useGetUsageSummaryQuery } from '@/features/credits/creditsApi';

export const USAGE_RANGES = [7, 30, 90];

const MAX_CHART_LABELS = 8;

function browserTimezone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  } catch {
    return 'UTC';
  }
}

export function useUsageSummary(days) {
  return useGetUsageSummaryQuery({ days, timezone: browserTimezone() });
}

function formatDay(date) {
  return new Date(`${date}T00:00:00`).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

export function buildDailyChart(daily = []) {
  const step = Math.max(1, Math.ceil(daily.length / MAX_CHART_LABELS));
  const lastIndex = daily.length - 1;

  return {
    labels: daily.map((day, index) =>
      (lastIndex - index) % step === 0
        ? formatDay(day.date)
        : '​'.repeat(index + 1),
    ),
    values: daily.map((day) => day.credits),
  };
}
