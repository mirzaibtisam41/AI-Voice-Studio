import {
  REFRESH_COOKIE_NAME,
  buildRefreshCookieConfig,
} from '#src/config/index.js';

export function setRefreshCookieUtil({ reply, refreshToken }) {
  reply.setCookie(
    REFRESH_COOKIE_NAME,
    refreshToken,
    buildRefreshCookieConfig({ appConfig: reply.server.config }),
  );
}
