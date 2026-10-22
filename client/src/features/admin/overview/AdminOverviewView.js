'use client';

import Link from 'next/link';
import { Activity, AudioWaveform, Coins, Users } from 'lucide-react';
import { HorizontalBars, LineChart } from '@/components/charts/Charts';
import { Button } from '@/components/ui/button';
import { Panel } from '@/components/ui/Panel';
import { StatCard } from '@/components/ui/StatCard';
import { StatusBadge, Tag } from '@/components/ui/StatusBadge';
import { TableRow } from '@/components/ui/table';
import { AdminCell, AdminTable } from '@/features/admin/shared/AdminTable';
import { AdminPageHeader } from '@/features/admin/shared/AdminToolbar';
import { formatTimeOfDay } from '@/features/admin/shared/adminFormat';
import { RECENT_FAILED_JOBS } from '@/mocks/adminJobs';
import {
  FEATURE_USAGE,
  PLATFORM_REQUEST_WEEKS,
  PLATFORM_REQUESTS,
  PROVIDER_STATUS,
} from '@/mocks/adminOverview';

const FAILED_COLUMNS = ['Job', 'User', 'Type', 'Error', 'Time'];

function LatencyCard() {
  return (
    <div className="flex min-w-0 flex-col gap-3 rounded-2xl border bg-card p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[12.5px] text-muted-foreground">Avg. API latency</p>
        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand-tint text-brand">
          <Activity className="size-4" aria-hidden="true" />
        </span>
      </div>
      <p className="truncate font-serif text-[28px] leading-none font-semibold tracking-tight">
        146ms
      </p>
      <p className="text-[12px] text-success">−8ms vs last week</p>
    </div>
  );
}

function ProviderStatusPanel() {
  const rows = [
    ['Last checked', PROVIDER_STATUS.lastChecked],
    ['Error rate (24h)', PROVIDER_STATUS.errorRate],
    ['p95 latency', PROVIDER_STATUS.p95Latency],
    ['Requests today', PROVIDER_STATUS.requestsToday],
  ];

  return (
    <Panel
      title="Provider status"
      description="Health of connected AI providers"
    >
      <div className="flex items-center justify-between gap-3 rounded-xl border bg-field/60 px-3.5 py-3">
        <div className="min-w-0">
          <p className="text-[13.5px] font-semibold">{PROVIDER_STATUS.name}</p>
          <p className="font-mono text-[11.5px] text-ink-3">api.openai.com</p>
        </div>
        <StatusBadge tone="success">{PROVIDER_STATUS.status}</StatusBadge>
      </div>
      <dl className="grid grid-cols-2 gap-3">
        {rows.map(([label, value]) => (
          <div key={label} className="flex flex-col gap-0.5">
            <dt className="text-[11.5px] text-ink-3">{label}</dt>
            <dd className="font-mono text-[13px]">{value}</dd>
          </div>
        ))}
      </dl>
    </Panel>
  );
}

export function AdminOverviewView() {
  return (
    <div className="flex flex-col gap-4">
      <AdminPageHeader title="Platform overview">
        <StatusBadge tone="success">All systems operational</StatusBadge>
      </AdminPageHeader>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Monthly active users"
          value="3,284"
          icon={Users}
          trend="+9.4% MoM"
        />
        <StatCard
          label="Credits used today"
          value="18,640"
          icon={Coins}
          note="Avg. 3.5 credits per generation"
        />
        <StatCard
          label="Generations today"
          value="5,271"
          icon={AudioWaveform}
          note="Across all features"
        />
        <LatencyCard />
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <Panel
          title="Platform requests (weekly)"
          description="API requests across all features, last 8 weeks"
        >
          <LineChart
            labels={PLATFORM_REQUEST_WEEKS}
            series={[
              { name: 'Requests', color: 'blue', values: PLATFORM_REQUESTS },
            ]}
            area
            label="Weekly platform requests"
          />
        </Panel>
        <Panel
          title="Usage by feature"
          description="Share of generations this month"
        >
          <HorizontalBars items={FEATURE_USAGE} unit="%" />
        </Panel>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <section className="flex min-w-0 flex-col gap-3">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-[14px] font-semibold">Recent failed jobs</h2>
            <Button asChild variant="ghost" size="sm">
              <Link href="/admin/generations">View all</Link>
            </Button>
          </div>
          <AdminTable columns={FAILED_COLUMNS} tableClassName="min-w-[560px]">
            {RECENT_FAILED_JOBS.map((job) => (
              <TableRow key={job.id}>
                <AdminCell className="font-mono text-[12px]">
                  {job.id}
                </AdminCell>
                <AdminCell className="whitespace-nowrap">
                  {job.userName}
                </AdminCell>
                <AdminCell>
                  <Tag>{job.type}</Tag>
                </AdminCell>
                <AdminCell>
                  <StatusBadge tone="danger" dot={false}>
                    {job.errorCategory}
                  </StatusBadge>
                </AdminCell>
                <AdminCell className="font-mono text-[12px] whitespace-nowrap text-ink-3">
                  {formatTimeOfDay(job.startedAt)}
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
