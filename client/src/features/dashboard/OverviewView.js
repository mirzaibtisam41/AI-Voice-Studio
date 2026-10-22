'use client';

import { useState } from 'react';
import { useSelector } from 'react-redux';
import { Bot, FileText, MessageSquare, Mic, Radio, Wallet } from 'lucide-react';
import { LineChart } from '@/components/charts/Charts';
import { ChoiceChips } from '@/components/ui/ChoiceChips';
import { Panel } from '@/components/ui/Panel';
import { StatCard } from '@/components/ui/StatCard';
import { Skeleton } from '@/components/ui/skeleton';
import { StatValue } from '@/features/credits/StatValue';
import { selectCurrentUser } from '@/features/auth/authSlice';
import { buildDailyChart, useUsageSummary } from '@/features/credits/usage';
import { useCountAgentsByStatusQuery } from '@/features/dashboard/dashboardApi';
import { QuickActions } from '@/features/dashboard/QuickActions';
import { RecentProjects } from '@/features/dashboard/RecentProjects';
import { useBalance } from '@/hooks/useBalance';

const CHART_RANGES = [
  { value: 7, label: '7 days' },
  { value: 30, label: '30 days' },
];

export function OverviewView() {
  const user = useSelector(selectCurrentUser);
  const [chartDays, setChartDays] = useState(7);
  const { balance, isLoading: balanceLoading } = useBalance();
  const { data: usage, isLoading: usageLoading } = useUsageSummary(30);
  const { data: chartUsage, isLoading: chartLoading } =
    useUsageSummary(chartDays);
  const { data: liveAgents, isLoading: liveLoading } =
    useCountAgentsByStatusQuery('live');
  const { data: draftAgents } = useCountAgentsByStatusQuery('draft');
  const firstName = user?.name?.trim().split(/\s+/)[0] ?? '';
  const counts = usage?.counts;
  const daily = buildDailyChart(chartUsage?.daily);

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="font-serif text-[26px] leading-tight font-semibold tracking-tight sm:text-[30px]">
          Welcome back{firstName ? `, ${firstName}` : ''}
        </h2>
        <p className="mt-1 text-[13.5px] text-ink-3">
          Here&apos;s what&apos;s happening across your studio.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          label="Credit balance"
          value={<StatValue value={balance} isLoading={balanceLoading} />}
          icon={Wallet}
          note="credits available"
        />
        <StatCard
          label="Speech generated"
          value={
            <StatValue
              value={counts?.speechGenerated}
              isLoading={usageLoading}
            />
          }
          icon={Mic}
          note="text to speech runs, last 30 days"
        />
        <StatCard
          label="Transcriptions"
          value={
            <StatValue
              value={counts?.transcriptions}
              isLoading={usageLoading}
            />
          }
          icon={FileText}
          note="files transcribed, last 30 days"
        />
        <StatCard
          label="Real-time minutes"
          value={
            <StatValue
              value={counts?.realtimeMinutes}
              isLoading={usageLoading}
            />
          }
          icon={Radio}
          note="live conversations, last 30 days"
        />
        <StatCard
          label="Agent messages"
          value={
            <StatValue value={counts?.agentMessages} isLoading={usageLoading} />
          }
          icon={MessageSquare}
          note="test chat messages, last 30 days"
        />
        <StatCard
          label="Active voice agents"
          value={<StatValue value={liveAgents} isLoading={liveLoading} />}
          icon={Bot}
          note={
            draftAgents === undefined ? 'live now' : `${draftAgents} in draft`
          }
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <Panel
          title="Credit usage"
          description="Credits spent across all features"
          action={
            <ChoiceChips
              label="Usage range"
              options={CHART_RANGES}
              value={chartDays}
              onChange={setChartDays}
              className="shrink-0 flex-nowrap"
            />
          }
        >
          {chartLoading ? (
            <Skeleton className="h-61 w-full" />
          ) : (
            <LineChart
              labels={daily.labels}
              series={[
                { name: 'Credits', color: 'brand', values: daily.values },
              ]}
              area
              height={220}
              label={`Credits used per day, last ${chartDays} days`}
            />
          )}
        </Panel>
        <RecentProjects />
      </div>

      <QuickActions />
    </div>
  );
}
