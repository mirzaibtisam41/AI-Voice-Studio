const DAY_MS = 24 * 60 * 60 * 1000;

export function formatLocalDateUtil({ date, timezone }) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

export function listLocalDaysUtil({ days, timezone, now = new Date() }) {
  const today = formatLocalDateUtil({ date: now, timezone });
  const todayStart = Date.parse(`${today}T00:00:00Z`);

  return Array.from({ length: days }, (_, index) =>
    new Date(todayStart - (days - 1 - index) * DAY_MS)
      .toISOString()
      .slice(0, 10),
  );
}

export function buildUsageWindowStartUtil({ days, now = new Date() }) {
  return new Date(now.getTime() - (days + 1) * DAY_MS);
}
