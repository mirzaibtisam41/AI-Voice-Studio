import { logoutService } from '#src/modules/auth/features/logout/logout.service.js';
import {
  clearRefreshCookieUtil,
  readRefreshCookieUtil,
} from '#src/modules/auth/shared/utils/index.js';

export async function logoutController(request, reply) {
  await logoutService({ refreshToken: readRefreshCookieUtil({ request }) });

  clearRefreshCookieUtil({ reply });

  return reply.success({ message: 'Logged out successfully' });
}
