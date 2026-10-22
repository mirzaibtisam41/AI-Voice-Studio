import {
  AUTH_TOKEN_TYPE,
  EMAIL_VERIFY_TOKEN_TTL_HOURS,
} from '#src/modules/auth-tokens/auth-token.constants.js';
import { issueAuthTokenService } from '#src/modules/auth-tokens/shared/services/index.js';
import { buildActionEmailTemplate } from '#src/modules/auth/shared/emails/index.js';

export async function sendVerificationEmailService({
  server,
  userId,
  email,
  name,
}) {
  const token = await issueAuthTokenService({
    userId,
    type: AUTH_TOKEN_TYPE.EMAIL_VERIFY,
    validForMinutes: EMAIL_VERIFY_TOKEN_TTL_HOURS * 60,
  });

  return server.mailer.sendEmail({
    to: email,
    ...buildActionEmailTemplate({
      subject: 'Confirm your email for AI Voice Studio',
      name,
      intro: `Welcome to AI Voice Studio. Please confirm that this is your email address. The link works for ${EMAIL_VERIFY_TOKEN_TTL_HOURS} hours.`,
      buttonLabel: 'Confirm my email',
      link: `${server.config.APP_URL}/verify-email?token=${token}`,
      outro:
        'If you did not create an account, you can ignore this email and nothing will happen.',
    }),
  });
}
