export function formatCredits(value) {
  return Math.round(value).toLocaleString('en-US');
}

export function formatSignedCredits(value) {
  const sign = value > 0 ? '+' : value < 0 ? '−' : '';

  return `${sign}${Math.abs(Math.round(value)).toLocaleString('en-US')}`;
}

export function formatUsd(value, fractionDigits = 2) {
  return value.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  });
}

export function formatTimeOfDay(value) {
  return new Date(value).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function simulateWork(callback, delay = 900) {
  return window.setTimeout(callback, delay);
}
