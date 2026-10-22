'use client';

import { useSelector } from 'react-redux';
import { BarChart3, Gift, Mic, Wallet } from 'lucide-react';
import { StatCard } from '@/components/ui/StatCard';
import { SIGNUP_CREDITS } from '@/constants/pricing';
import {
  selectBalance,
  selectTransactions,
} from '@/features/credits/walletSlice';
import { totalUsed } from '@/features/credits/walletUsage';

export function CreditStats() {
  const balance = useSelector(selectBalance);
  const transactions = useSelector(selectTransactions);
  const used = totalUsed(transactions);
  const runs = transactions.filter(
    (transaction) => transaction.amount < 0,
  ).length;

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        label="Current balance"
        value={balance.toLocaleString()}
        icon={Wallet}
        note="credits available"
      />
      <StatCard
        label="Credits used"
        value={used.toLocaleString()}
        icon={BarChart3}
        note={`of ${SIGNUP_CREDITS} free credits`}
      />
      <StatCard
        label="Runs"
        value={runs.toLocaleString()}
        icon={Mic}
        note="generations, transcriptions and sessions"
      />
      <StatCard
        label="Signup bonus"
        value={SIGNUP_CREDITS}
        icon={Gift}
        note="free demo, no payments"
      />
    </div>
  );
}
