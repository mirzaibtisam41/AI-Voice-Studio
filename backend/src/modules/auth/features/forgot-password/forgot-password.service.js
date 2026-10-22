import {
  AUTH_TOKEN_TYPE,
  PASSWORD_RESET_TOKEN_TTL_MINUTES,
} from '#src/modules/auth-tokens/auth-token.constants.js';
import {
  issueAuthTokenService,
  wasAuthTokenSentRecentlyService,
} from '#src/modules/auth-tokens/shared/services/index.js';
import { USER_STATUS } from '#src/modules/users/user.constants.js';
import { findUserWithPasswordByEmailRepository } from '#src/modules/users/shared/repositories/index.js';
import { PASSWORD_RESET_EMAIL_WAIT_SECONDS } from '#src/modules/auth/auth.constants.js';
import { buildActionEmailTemplate } from '#src/modules/auth/shared/emails/index.js';

export async function forgotPasswordService({ server, email }) {
  const user = await findUserWithPasswordByEmailRepository({
    email: email.trim().toLowerCase(),
  });

  if (!user || user.status === USER_STATUS.DEACTIVATED) return;

  const wasSentRecently = await wasAuthTokenSentRecentlyService({
    userId: user._id,
    type: AUTH_TOKEN_TYPE.PASSWORD_RESET,
    withinSeconds: PASSWORD_RESET_EMAIL_WAIT_SECONDS,
  });

  if (wasSentRecently) return;

  const token = await issueAuthTokenService({
    userId: user._id,
    type: AUTH_TOKEN_TYPE.PASSWORD_RESET,
    validForMinutes: PASSWORD_RESET_TOKEN_TTL_MINUTES,
  });

  await server.mailer.sendEmail({
    to: user.email,
    ...buildActionEmailTemplate({
      subject: 'Reset your AI Voice Studio password',
      name: user.name,
      intro: `Someone asked to reset the password of your AI Voice Studio account. Use the button below to choose a new one. The link works for ${PASSWORD_RESET_TOKEN_TTL_MINUTES} minutes and only once.`,
      buttonLabel: 'Choose a new password',
      link: `${server.config.APP_URL}/reset-password?token=${token}`,
      outro:
        'If you did not ask for this, you can ignore this email. Your password stays the same.',
    }),
  });
}
