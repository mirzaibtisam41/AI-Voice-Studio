'use client';

import Link from 'next/link';
import { AudioWaveform, Coins, Gift, Users } from 'lucide-react';
import { HorizontalBars, LineChart } from '@/components/charts/Charts';
import { FormAlert } from '@/components/ui/FormAlert';
import { Panel } from '@/components/ui/Panel';
import { StatCard } from '@/components/ui/StatCard';
import { StatusBadge, Tag } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { TableRow } from '@/components/ui/table';
import {
  useGetAnalyticsOverviewQuery,
  useListAiProvidersQuery,
} from '@/features/admin/adminApi';
import {
  AdminCell,
  AdminTable,
  TableStateRows,
} from '@/features/admin/shared/AdminTable';
import { AdminPageHeader } from '@/features/admin/shared/AdminToolbar';
import {
  capabilityShortLabel,
  formatCredits,
} from '@/features/admin/shared/adminFormat';
import { getErrorMessage } from '@/lib/apiError';
import { formatDateTime } from '@/lib/format';

const FAILED_COLUMNS = ['Job', 'User', 'Type', 'Error', 'Time'];

const BAR_COLORS = ['brand', 'blue', 'teal', 'amber', 'success'];

function formatWeekLabel(weekStart) {
  return new Date(`${weekStart}T00:00:00Z`).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

function ProviderStatusPanel() {
  const { data: providers, isLoading, error } = useListAiProvidersQuery();

  return (
    <Panel
      title="Providers"
      description="Connected AI providers and their status"
      action={
        <Button asChild variant="ghost" size="sm">
          <Link href="/admin/providers">Manage</Link>
        </Button>
      }
    >
      {isLoading ? <Skeleton className="h-16 w-full" /> : null}
      {error ? <FormAlert>{getErrorMessage(error)}</FormAlert> : null}
      {providers?.length === 0 ? (
        <p className="text-[12.5px] text-ink-3">No providers yet.</p>
      ) : null}
      {providers?.map((provider) => (
        <div
          key={provider.id}
          className="flex items-center justify-between gap-3 rounded-xl border bg-field/60 px-3.5 py-3"
        >
          <div className="min-w-0">
            <p className="text-[13.5px] font-semibold">{provider.name}</p>
            <p className="font-mono text-[11.5px] text-ink-3">
              {provider.code} · {provider.modelsCount}{' '}
              {provider.modelsCount === 1 ? 'model' : 'models'}
            </p>
          </div>
          <StatusBadge
            tone={provider.status === 'active' ? 'success' : 'neutral'}
          >
            {provider.status === 'active' ? 'Active' : 'Disabled'}
          </StatusBadge>
        </div>
      ))}
    </Panel>
  );
}

function StatsSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 4 }, (_, index) => (
        <Skeleton key={index} className="h-29.5 rounded-2xl" />
      ))}
    </div>
  );
}

export function AdminOverviewView() {
  const { data: overview, isLoading, error } = useGetAnalyticsOverviewQuery();

  return (
    <div className="flex flex-col gap-4">
      <AdminPageHeader title="Platform overview" />
      {error ? <FormAlert>{getErrorMessage(error)}</FormAlert> : null}
      {isLoading ? <StatsSkeleton /> : null}
      {overview ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Total users"
              value={formatCredits(overview.users.total)}
              icon={Users}
              note={`${formatCredits(overview.users.activeLast30Days)} active in 30 days · ${formatCredits(overview.users.newThisMonth)} new this month`}
            />
            <StatCard
              label="Generations today"
              value={formatCredits(overview.generations.today)}
              icon={AudioWaveform}
              note={`${formatCredits(overview.generations.last7Days)} in the last 7 days`}
            />
            <StatCard
              label="Credits used today"
              value={formatCredits(overview.credits.usedToday)}
              icon={Coins}
              note={`${formatCredits(overview.credits.usedLast30Days)} in the last 30 days`}
            />
            <StatCard
              label="Credits granted"
              value={formatCredits(overview.credits.grantedLast30Days)}
              icon={Gift}
              note="Signup bonuses and admin credits, 30 days"
            />
          </div>

          <div className="grid gap-4 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
            <Panel
              title="Platform requests (weekly)"
              description="Generations across all features, last 8 weeks"
            >
              <LineChart
                labels={overview.weeklyRequests.map((week) =>
                  formatWeekLabel(week.weekStart),
                )}
                series={[
                  {
                    name: 'Requests',
                    color: 'blue',
                    values: overview.weeklyRequests.map((week) => week.count),
                  },
                ]}
                area
                label="Weekly platform requests"
              />
            </Panel>
            <Panel
              title="Usage by feature"
              description="Credits used per feature, last 30 days"
            >
              <HorizontalBars
                items={overview.usageByCapability.map((item, index) => ({
                  label: capabilityShortLabel(item.capability),
                  value: item.credits,
                  color: BAR_COLORS[index % BAR_COLORS.length],
                }))}
                unit=""
              />
            </Panel>
          </div>
        </>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <section className="flex min-w-0 flex-col gap-3">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-[14px] font-semibold">Recent failed jobs</h2>
            <Button asChild variant="ghost" size="sm">
              <Link href="/admin/generations">View all</Link>
            </Button>
          </div>
          <AdminTable columns={FAILED_COLUMNS} tableClassName="min-w-[560px]">
            <TableStateRows
              colSpan={FAILED_COLUMNS.length}
              isLoading={isLoading}
              isEmpty={overview?.failedJobs.length === 0}
              empty="No failed jobs. Nice."
            />
            {overview?.failedJobs.map((job) => (
              <TableRow key={job.id}>
                <AdminCell className="font-mono text-[12px]">
                  {job.id.slice(-8)}
                </AdminCell>
                <AdminCell className="whitespace-nowrap">
                  {job.userEmail ?? '—'}
                </AdminCell>
                <AdminCell>
                  <Tag>{capabilityShortLabel(job.capability)}</Tag>
                </AdminCell>
                <AdminCell>
                  <StatusBadge tone="danger" dot={false}>
                    {job.errorCategory ?? 'unknown'}
                  </StatusBadge>
                </AdminCell>
                <AdminCell className="font-mono text-[12px] whitespace-nowrap text-ink-3">
                  {formatDateTime(job.createdAt)}
                </AdminCell>
              </TableRow>
            ))}
          </AdminTable>
        </section>
        <ProviderStatusPanel />
      </div>
    </div>
  );
}
