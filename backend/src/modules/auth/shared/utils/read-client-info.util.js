import { SESSION_USER_AGENT_MAX_LENGTH } from '#src/modules/auth-sessions/auth-session.constants.js';

export function readClientInfoUtil({ request }) {
  return {
    userAgent:
      request.headers['user-agent']?.slice(0, SESSION_USER_AGENT_MAX_LENGTH) ??
      null,
    ipAddress: request.ip ?? null,
  };
}
