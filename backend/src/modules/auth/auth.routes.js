import { checkUserIsLoggedInHook } from '#src/hooks/index.js';
import { forgotPasswordController } from '#src/modules/auth/features/forgot-password/forgot-password.controller.js';
import { forgotPasswordSchema } from '#src/modules/auth/features/forgot-password/forgot-password.schema.js';
import { getMeController } from '#src/modules/auth/features/get-me/get-me.controller.js';
import { listSessionsController } from '#src/modules/auth/features/list-sessions/list-sessions.controller.js';
import { loginController } from '#src/modules/auth/features/login/login.controller.js';
import { loginSchema } from '#src/modules/auth/features/login/login.schema.js';
import { logoutController } from '#src/modules/auth/features/logout/logout.controller.js';
import { logoutOtherSessionsController } from '#src/modules/auth/features/logout-other-sessions/logout-other-sessions.controller.js';
import { refreshSessionController } from '#src/modules/auth/features/refresh-session/refresh-session.controller.js';
import { registerController } from '#src/modules/auth/features/register/register.controller.js';
import { registerSchema } from '#src/modules/auth/features/register/register.schema.js';
import { resendVerificationController } from '#src/modules/auth/features/resend-verification/resend-verification.controller.js';
import { resetPasswordController } from '#src/modules/auth/features/reset-password/reset-password.controller.js';
import { resetPasswordSchema } from '#src/modules/auth/features/reset-password/reset-password.schema.js';
import { revokeSessionController } from '#src/modules/auth/features/revoke-session/revoke-session.controller.js';
import { revokeSessionSchema } from '#src/modules/auth/features/revoke-session/revoke-session.schema.js';
import { verifyEmailController } from '#src/modules/auth/features/verify-email/verify-email.controller.js';
import { verifyEmailSchema } from '#src/modules/auth/features/verify-email/verify-email.schema.js';

export async function authRoutes(fastify) {
  fastify.post(
    '/register',
    {
      schema: registerSchema,
      config: { rateLimit: { max: 10, timeWindow: '1 hour' } },
    },
    registerController,
  );

  fastify.post(
    '/login',
    {
      schema: loginSchema,
      config: { rateLimit: { max: 10, timeWindow: '15 minutes' } },
    },
    loginController,
  );

  fastify.post(
    '/refresh',
    { config: { rateLimit: { max: 60, timeWindow: '15 minutes' } } },
    refreshSessionController,
  );

  fastify.post(
    '/logout',
    { config: { rateLimit: { max: 30, timeWindow: '15 minutes' } } },
    logoutController,
  );

  fastify.post(
    '/forgot-password',
    {
      schema: forgotPasswordSchema,
      config: { rateLimit: { max: 5, timeWindow: '1 hour' } },
    },
    forgotPasswordController,
  );

  fastify.post(
    '/reset-password',
    {
      schema: resetPasswordSchema,
      config: { rateLimit: { max: 10, timeWindow: '15 minutes' } },
    },
    resetPasswordController,
  );

  fastify.post(
    '/verify-email',
    {
      schema: verifyEmailSchema,
      config: { rateLimit: { max: 20, timeWindow: '15 minutes' } },
    },
    verifyEmailController,
  );

  fastify.post(
    '/resend-verification',
    {
      onRequest: [checkUserIsLoggedInHook],
      config: { rateLimit: { max: 5, timeWindow: '1 hour' } },
    },
    resendVerificationController,
  );

  fastify.get('/me', { onRequest: [checkUserIsLoggedInHook] }, getMeController);

  fastify.get(
    '/sessions',
    { onRequest: [checkUserIsLoggedInHook] },
    listSessionsController,
  );

  fastify.delete(
    '/sessions/:familyId',
    { onRequest: [checkUserIsLoggedInHook], schema: revokeSessionSchema },
    revokeSessionController,
  );

  fastify.post(
    '/logout-others',
    { onRequest: [checkUserIsLoggedInHook] },
    logoutOtherSessionsController,
  );
}
