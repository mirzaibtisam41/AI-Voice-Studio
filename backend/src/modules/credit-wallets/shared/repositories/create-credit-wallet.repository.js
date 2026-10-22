import { CreditWalletModel } from '#src/modules/credit-wallets/credit-wallet.model.js';

export async function createCreditWalletRepository({ session, userId }) {
  const [wallet] = await CreditWalletModel.create([{ userId, balance: 0 }], {
    session,
  });

  return wallet;
}
