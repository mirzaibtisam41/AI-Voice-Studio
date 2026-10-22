import { CreditWalletModel } from '#src/modules/credit-wallets/credit-wallet.model.js';

export function findCreditWalletByUserIdRepository({ session, userId }) {
  return CreditWalletModel.findOne({ userId }).session(session ?? null);
}
