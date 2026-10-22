'use client';

import { useState } from 'react';
import { useSelector } from 'react-redux';
import { CreditPackages } from '@/features/credits/CreditPackages';
import { CreditStats } from '@/features/credits/CreditStats';
import { TransactionHistory } from '@/features/credits/TransactionHistory';
import { UsagePanels } from '@/features/credits/UsagePanels';
import { selectBalance } from '@/features/credits/walletSlice';
import { TRANSACTIONS } from '@/mocks/transactions';

export function CreditsView() {
  const balance = useSelector(selectBalance);
  const [transactions, setTransactions] = useState(TRANSACTIONS);

  const handlePurchased = (creditPackage) => {
    const transaction = {
      id: `txn_${Date.now()}`,
      date: new Date().toISOString(),
      description: `${creditPackage.name} — ${creditPackage.credits.toLocaleString()} credits`,
      feature: 'Billing',
      type: 'topup',
      credits: creditPackage.credits,
      balanceAfter: balance + creditPackage.credits,
    };

    setTransactions((current) => [transaction, ...current]);
  };

  return (
    <div className="flex flex-col gap-5">
      <CreditStats />
      <UsagePanels />
      <CreditPackages onPurchased={handlePurchased} />
      <TransactionHistory transactions={transactions} />
    </div>
  );
}
