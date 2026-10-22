import { BadRequestError, TooManyRequestsError } from '#src/utils/index.js';
import { AUTH_TOKEN_TYPE } from '#src/modules/auth-tokens/auth-token.constants.js';
import { wasAuthTokenSentRecentlyService } from '#src/modules/auth-tokens/shared/services/index.js';
import { VERIFICATION_EMAIL_WAIT_SECONDS } from '#src/modules/auth/auth.constants.js';
import { sendVerificationEmailService } from '#src/modules/auth/shared/services/index.js';

export async function resendVerificationService({ server, user }) {
  if (user.emailVerifiedAt) {
    throw new BadRequestError('Your email is already confirmed');
  }

  const wasSentRecently = await wasAuthTokenSentRecentlyService({
    userId: user._id,
    type: AUTH_TOKEN_TYPE.EMAIL_VERIFY,
    withinSeconds: VERIFICATION_EMAIL_WAIT_SECONDS,
  });

  if (wasSentRecently) {
    throw new TooManyRequestsError(
      'We just sent you an email. Wait a minute before asking again.',
    );
  }

  await sendVerificationEmailService({
    server,
    userId: user._id,
    email: user.email,
    name: user.name,
  });

  return { email: user.email };
}
