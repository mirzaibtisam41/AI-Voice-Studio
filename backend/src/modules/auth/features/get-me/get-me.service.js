import { findCreditWalletByUserIdRepository } from '#src/modules/credit-wallets/shared/repositories/index.js';

export async function getMeService({ user }) {
  const wallet = await findCreditWalletByUserIdRepository({ userId: user._id });

  return { user, balance: wallet?.balance ?? 0 };
}
