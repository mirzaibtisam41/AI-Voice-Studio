import { REFRESH_COOKIE_NAME } from '#src/config/index.js';

export function readRefreshCookieUtil({ request }) {
  return request.cookies?.[REFRESH_COOKIE_NAME] || null;
}
