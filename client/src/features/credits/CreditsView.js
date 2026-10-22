'use client';

import { CreditStats } from '@/features/credits/CreditStats';
import { RatesPanel } from '@/features/credits/RatesPanel';
import { TransactionHistory } from '@/features/credits/TransactionHistory';
import { UsagePanels } from '@/features/credits/UsagePanels';

export function CreditsView() {
  return (
    <div className="flex flex-col gap-5">
      <CreditStats />
      <UsagePanels />
      <RatesPanel />
      <TransactionHistory />
    </div>
  );
}
