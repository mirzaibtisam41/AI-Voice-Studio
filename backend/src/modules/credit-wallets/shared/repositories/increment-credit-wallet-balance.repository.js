import { CreditWalletModel } from '#src/modules/credit-wallets/credit-wallet.model.js';

export function incrementCreditWalletBalanceRepository({
  session,
  userId,
  amount,
}) {
  const filter =
    amount < 0 ? { userId, balance: { $gte: -amount } } : { userId };

  return CreditWalletModel.findOneAndUpdate(
    filter,
    { $inc: { balance: amount } },
    { returnDocument: 'after', session },
  );
}
