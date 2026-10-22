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
  selectBalance,
  selectTransactions,
} from '@/features/credits/walletSlice';
import { countRuns, dailyUsage } from '@/features/credits/walletUsage';
import { AGENTS } from '@/mocks/agents';

export function OverviewView() {
  const user = useSelector(selectCurrentUser);
  const balance = useSelector(selectBalance);
  const transactions = useSelector(selectTransactions);
  const firstName = user?.name?.trim().split(/\s+/)[0] ?? '';
  const daily = dailyUsage(transactions);
  const liveAgents = AGENTS.filter((agent) => agent.status === 'live').length;
  const draftAgents = AGENTS.filter((agent) => agent.status === 'draft').length;

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
          note="free demo credits"
        />
        <StatCard
          label="Audio generated"
          value={countRuns(transactions, 'textToSpeech')}
          icon={Mic}
          note="text to speech takes"
        />
        <StatCard
          label="Transcriptions"
          value={countRuns(transactions, 'speechToText')}
          icon={FileText}
          note="files transcribed"
        />
        <StatCard
          label="Active voice agents"
          value={liveAgents}
          icon={Bot}
          note={`${draftAgents} in draft`}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <Panel
          title="Credit usage"
          description="Credits spent across all features"
          action={<Tag className="shrink-0">Last 7 days</Tag>}
        >
          <LineChart
            labels={daily.labels}
            series={[{ name: 'Credits', color: 'brand', values: daily.values }]}
            area
            height={220}
            label="Credits used per day, last 7 days"
          />
        </Panel>
        <RecentProjects />
      </div>

      <QuickActions />
    </div>
  );
}
