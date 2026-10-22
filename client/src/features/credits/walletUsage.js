import { FEATURES } from '@/constants/pricing';

const DAY_MS = 24 * 60 * 60 * 1000;

function isUsage(transaction) {
  return transaction.amount < 0;
}

export function featureLabel(feature) {
  return FEATURES[feature]?.label ?? feature;
}

export function totalUsed(transactions) {
  return transactions
    .filter(isUsage)
    .reduce((sum, transaction) => sum - transaction.amount, 0);
}

export function countRuns(transactions, feature) {
  return transactions.filter(
    (transaction) => isUsage(transaction) && transaction.feature === feature,
  ).length;
}

export function usageByFeature(transactions) {
  const totals = new Map();

  for (const transaction of transactions.filter(isUsage)) {
    totals.set(
      transaction.feature,
      (totals.get(transaction.feature) ?? 0) - transaction.amount,
    );
  }

  return [...totals.entries()].map(([feature, value]) => ({
    label: featureLabel(feature),
    value,
    color: FEATURES[feature]?.color ?? 'brand',
  }));
}

function dayKey(date) {
  return date.toISOString().slice(0, 10);
}

export function dailyUsage(transactions, days = 7) {
  const today = new Date();
  const range = Array.from({ length: days }, (_, index) => {
    const date = new Date(today.getTime() - (days - 1 - index) * DAY_MS);

    return {
      key: dayKey(date),
      label: date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      }),
    };
  });
  const totals = new Map(range.map((day) => [day.key, 0]));

  for (const transaction of transactions.filter(isUsage)) {
    const key = dayKey(new Date(transaction.createdAt));

    if (totals.has(key)) totals.set(key, totals.get(key) - transaction.amount);
  }

  return {
    labels: range.map((day) => day.label),
    values: range.map((day) => totals.get(day.key)),
  };
}
