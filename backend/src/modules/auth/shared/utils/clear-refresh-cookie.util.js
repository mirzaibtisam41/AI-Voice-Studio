import {
  REFRESH_COOKIE_NAME,
  buildRefreshCookieConfig,
} from '#src/config/index.js';

export function clearRefreshCookieUtil({ reply }) {
  reply.clearCookie(
    REFRESH_COOKIE_NAME,
    buildRefreshCookieConfig({ appConfig: reply.server.config }),
  );
}
