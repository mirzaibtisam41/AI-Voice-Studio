import { loginService } from '#src/modules/auth/features/login/login.service.js';
import {
  readClientInfoUtil,
  setRefreshCookieUtil,
} from '#src/modules/auth/shared/utils/index.js';

export async function loginController(request, reply) {
  const { accessToken, refreshToken, user } = await loginService({
    server: request.server,
    data: request.body,
    client: readClientInfoUtil({ request }),
  });

  setRefreshCookieUtil({ reply, refreshToken });

  return reply.success({
    data: { accessToken, user },
    message: 'Logged in successfully',
  });
}
