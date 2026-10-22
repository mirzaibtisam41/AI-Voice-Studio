import { ERROR_CODE } from '#src/constants/index.js';
import { refreshSessionService } from '#src/modules/auth/features/refresh-session/refresh-session.service.js';
import {
  clearRefreshCookieUtil,
  readClientInfoUtil,
  readRefreshCookieUtil,
  setRefreshCookieUtil,
} from '#src/modules/auth/shared/utils/index.js';

export async function refreshSessionController(request, reply) {
  let result;

  try {
    result = await refreshSessionService({
      server: request.server,
      refreshToken: readRefreshCookieUtil({ request }),
      client: readClientInfoUtil({ request }),
    });
  } catch (error) {
    if (error.code === ERROR_CODE.UNAUTHORIZED) {
      clearRefreshCookieUtil({ reply });
    }

    throw error;
  }

  setRefreshCookieUtil({ reply, refreshToken: result.refreshToken });

  return reply.success({
    data: { accessToken: result.accessToken, user: result.user },
    message: 'Session refreshed',
  });
}
