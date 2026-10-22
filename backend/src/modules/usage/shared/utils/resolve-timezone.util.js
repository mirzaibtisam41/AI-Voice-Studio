import { USAGE_DEFAULT_TIMEZONE } from '#src/modules/usage/usage.constants.js';

export function resolveTimezoneUtil({ timezone }) {
  if (!timezone) return USAGE_DEFAULT_TIMEZONE;

  try {
    return new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
    }).resolvedOptions().timeZone;
  } catch {
    return USAGE_DEFAULT_TIMEZONE;
  }
}
