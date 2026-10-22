import { deactivateMyAccountService } from '#src/modules/users/features/deactivate-my-account/deactivate-my-account.service.js';
import { clearRefreshCookieUtil } from '#src/modules/auth/shared/utils/index.js';

export async function deactivateMyAccountController(request, reply) {
  await deactivateMyAccountService({
    userId: request.user._id,
    password: request.body.password,
  });

  clearRefreshCookieUtil({ reply });

  return reply.success({ message: 'Your account has been deactivated' });
}
