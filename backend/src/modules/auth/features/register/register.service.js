import {
  ConflictError,
  hashPasswordUtil,
  isDuplicateKeyErrorUtil,
  runInTransactionUtil,
} from '#src/utils/index.js';
import { CREDIT_TRANSACTION_TYPE } from '#src/modules/credit-transactions/credit-transaction.constants.js';
import { createCreditWalletRepository } from '#src/modules/credit-wallets/shared/repositories/index.js';
import { applyCreditChangeService } from '#src/modules/credit-wallets/shared/services/index.js';
import { getPlatformSettingsService } from '#src/modules/platform-settings/shared/services/index.js';
import { createUserSettingsRepository } from '#src/modules/user-settings/shared/repositories/index.js';
import { createUserRepository } from '#src/modules/users/shared/repositories/index.js';
import { toPublicUserUtil } from '#src/modules/users/shared/utils/index.js';
import { sendVerificationEmailService } from '#src/modules/auth/shared/services/index.js';

async function createAccount({ name, email, passwordHash, signupCredits }) {
  return runInTransactionUtil({
    work: async ({ session }) => {
      const user = await createUserRepository({
        session,
        data: { name, email, passwordHash },
      });

      await createCreditWalletRepository({ session, userId: user._id });

      if (signupCredits > 0) {
        await applyCreditChangeService({
          session,
          userId: user._id,
          amount: signupCredits,
          type: CREDIT_TRANSACTION_TYPE.SIGNUP_GRANT,
          reason: 'Signup bonus',
          idempotencyKey: `signup:${user._id}`,
        });
      }

      await createUserSettingsRepository({ session, userId: user._id });

      return user;
    },
  });
}

async function sendVerificationEmailSafely({ server, user }) {
  try {
    await sendVerificationEmailService({
      server,
      userId: user._id,
      email: user.email,
      name: user.name,
    });
  } catch (error) {
    server.log.warn({ err: error }, 'Verification email could not be sent');
  }
}

export async function registerService({ server, data }) {
  const name = data.name.trim();
  const email = data.email.trim().toLowerCase();
  const passwordHash = await hashPasswordUtil({ password: data.password });
  const { signupCredits } = await getPlatformSettingsService();

  let user;

  try {
    user = await createAccount({ name, email, passwordHash, signupCredits });
  } catch (error) {
    if (isDuplicateKeyErrorUtil({ error })) {
      throw new ConflictError('An account with this email already exists');
    }

    throw error;
  }

  await sendVerificationEmailSafely({ server, user });

  return toPublicUserUtil({ user });
}
