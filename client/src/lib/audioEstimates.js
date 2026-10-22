const BYTES_PER_SECOND = 16000;

export function estimateSeconds(file) {
  if (!file) return 0;

  return Math.max(6, Math.round(file.size / BYTES_PER_SECOND));
}

export function creditsPerStartedMinute(seconds, rate) {
  if (!seconds) return 0;

  return Math.ceil(seconds / 60) * rate;
}
