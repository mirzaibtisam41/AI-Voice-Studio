'use client';

import { useDispatch, useSelector } from 'react-redux';
import { BarChart3, Crown, RefreshCw, Wallet } from 'lucide-react';
import { toast } from 'sonner';
import { StatCard } from '@/components/ui/StatCard';
import { Switch } from '@/components/ui/switch';
import {
  autoReloadChanged,
  selectAutoReload,
  selectBalance,
} from '@/features/credits/walletSlice';
import { MONTHLY_ALLOWANCE, USED_THIS_MONTH } from '@/mocks/usage';

function AutoReloadCard() {
  const dispatch = useDispatch();
  const autoReload = useSelector(selectAutoReload);

  const handleChange = (checked) => {
    dispatch(autoReloadChanged(checked));
    toast.success(checked ? 'Auto-reload turned on' : 'Auto-reload turned off');
  };

  return (
    <div className="flex min-w-0 flex-col gap-3 rounded-2xl border bg-card p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[12.5px] text-muted-foreground">Auto-reload</p>
        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand-tint text-brand">
          <RefreshCw className="size-4" aria-hidden="true" />
        </span>
      </div>
      <div className="flex items-center justify-between gap-3">
        <p className="font-serif text-[28px] leading-none font-semibold tracking-tight">
          {autoReload ? 'On' : 'Off'}
        </p>
        <Switch
          checked={autoReload}
          onCheckedChange={handleChange}
          aria-label="Auto-reload"
        />
      </div>
      <p className="truncate text-[12px] text-ink-3">
        {autoReload ? 'Adds 150,000 below 20,000' : 'Top up manually'}
      </p>
    </div>
  );
}

export function CreditStats() {
  const balance = useSelector(selectBalance);

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        label="Current balance"
        value={balance.toLocaleString()}
        icon={Wallet}
        note="credits available"
      />
      <StatCard
        label="Used this month"
        value={USED_THIS_MONTH.toLocaleString()}
        icon={BarChart3}
        note={`of ${MONTHLY_ALLOWANCE.toLocaleString()}`}
      />
      <StatCard label="Plan" value="Pro" icon={Crown} note="Renews Nov 14" />
      <AutoReloadCard />
    </div>
  );
}
