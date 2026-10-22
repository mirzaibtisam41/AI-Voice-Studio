'use client';

import { BarChart3, Gift, Mic, Wallet } from 'lucide-react';
import { StatCard } from '@/components/ui/StatCard';
import { StatValue } from '@/features/credits/StatValue';
import { useGetPublicPlatformQuery } from '@/features/credits/creditsApi';
import { useUsageSummary } from '@/features/credits/usage';
import { useBalance } from '@/hooks/useBalance';

export function CreditStats() {
  const { balance, isLoading: balanceLoading } = useBalance();
  const { data: usage, isLoading: usageLoading } = useUsageSummary(30);
  const { data: platform, isLoading: platformLoading } =
    useGetPublicPlatformQuery();
  const failedRuns = usage?.totals.failedRuns ?? 0;

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        label="Current balance"
        value={<StatValue value={balance} isLoading={balanceLoading} />}
        icon={Wallet}
        note="credits available"
      />
      <StatCard
        label="Credits used"
        value={
          <StatValue
            value={usage?.totals.creditsUsed}
            isLoading={usageLoading}
          />
        }
        icon={BarChart3}
        note="last 30 days"
      />
      <StatCard
        label="Runs"
        value={
          <StatValue value={usage?.totals.runs} isLoading={usageLoading} />
        }
        icon={Mic}
        note={
          failedRuns > 0
            ? `last 30 days, ${failedRuns} failed and refunded`
            : 'completed in the last 30 days'
        }
      />
      <StatCard
        label="Signup bonus"
        value={
          <StatValue
            value={platform?.settings.signupCredits}
            isLoading={platformLoading}
          />
        }
        icon={Gift}
        note="free demo, no payments"
      />
    </div>
  );
}
