'use client';

import { useSelector } from 'react-redux';
import { Bot, FileText, Mic, Wallet } from 'lucide-react';
import { LineChart } from '@/components/charts/Charts';
import { Panel } from '@/components/ui/Panel';
import { StatCard } from '@/components/ui/StatCard';
import { Tag } from '@/components/ui/StatusBadge';
import { selectCurrentUser } from '@/features/auth/authSlice';
import { QuickActions } from '@/features/dashboard/QuickActions';
import { RecentProjects } from '@/features/dashboard/RecentProjects';
import {
  selectAutoReload,
  selectBalance,
} from '@/features/credits/walletSlice';
import { MONTHLY_USAGE, OVERVIEW_STATS } from '@/mocks/usage';

export function OverviewView() {
  const user = useSelector(selectCurrentUser);
  const balance = useSelector(selectBalance);
  const autoReload = useSelector(selectAutoReload);
  const firstName = user?.name?.trim().split(/\s+/)[0] ?? '';

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="font-serif text-[26px] leading-tight font-semibold tracking-tight sm:text-[30px]">
          Welcome back, {firstName}
        </h2>
        <p className="mt-1 text-[13.5px] text-ink-3">
          Here&apos;s what&apos;s happening across your studio.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Credit balance"
          value={balance.toLocaleString()}
          icon={Wallet}
          note={`auto-reload ${autoReload ? 'on' : 'off'}`}
        />
        <StatCard
          label="Audio generated"
          value={OVERVIEW_STATS.audioGenerated.toLocaleString()}
          icon={Mic}
          trend="+12% this month"
        />
        <StatCard
          label="Minutes transcribed"
          value={OVERVIEW_STATS.minutesTranscribed.toLocaleString()}
          icon={FileText}
          trend="+4% this month"
        />
        <StatCard
          label="Active voice agents"
          value={OVERVIEW_STATS.activeAgents}
          icon={Bot}
          note={`${OVERVIEW_STATS.draftAgents} in draft`}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <Panel
          title="Credit usage"
          description="Credits spent across all features"
          action={<Tag className="shrink-0">Last 7 months</Tag>}
        >
          <LineChart
            labels={MONTHLY_USAGE.labels}
            series={[
              { name: 'Credits', color: 'brand', values: MONTHLY_USAGE.values },
            ]}
            area
            height={220}
            label="Credits used per month, April to October"
          />
        </Panel>
        <RecentProjects />
      </div>

      <QuickActions />
    </div>
  );
}
