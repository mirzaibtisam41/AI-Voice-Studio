'use client';

import { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { ChoiceChips } from '@/components/ui/ChoiceChips';
import { Spinner } from '@/components/ui/Spinner';
import { StatusBadge, Tag } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/button';
import { TableRow } from '@/components/ui/table';
import {
  useGetGenerationStatsQuery,
  useListAdminGenerationsQuery,
} from '@/features/admin/adminApi';
import {
  GENERATION_STATUSES,
  JobDetailsSheet,
} from '@/features/admin/generations/JobDetailsSheet';
import {
  AdminCell,
  AdminTable,
  PaginationFooter,
  TableStateRows,
  serverPagination,
} from '@/features/admin/shared/AdminTable';
import {
  AdminPageHeader,
  DateFilter,
  FilterSelect,
  SearchField,
} from '@/features/admin/shared/AdminToolbar';
import {
  CAPABILITY_SHORT_LABELS,
  capabilityShortLabel,
  formatCredits,
  formatTimeOfDay,
} from '@/features/admin/shared/adminFormat';
import { useDebouncedValue } from '@/features/admin/shared/useDebouncedValue';
import { formatDateTime } from '@/lib/format';
import { cn } from '@/lib/utils';

const PAGE_SIZE = 10;

const STATUS_OPTIONS = [
  { value: 'all', label: 'All statuses' },
  ...Object.entries(GENERATION_STATUSES).map(([value, status]) => ({
    value,
    label: status.label,
  })),
];

const TYPE_OPTIONS = [
  { value: 'all', label: 'All' },
  ...Object.entries(CAPABILITY_SHORT_LABELS).map(([value, label]) => ({
    value,
    label,
  })),
];

const COLUMNS = [
  'Job',
  'User',
  'Type',
  'Model',
  'Status',
  'Credits',
  'Started',
];

const STAT_ITEMS = [
  { key: 'all', label: 'Jobs', className: 'text-foreground' },
  { key: 'processing', label: 'Processing', className: 'text-blue' },
  { key: 'completed', label: 'Completed', className: 'text-success' },
  { key: 'failed', label: 'Failed', className: 'text-danger' },
];

function StatsStrip() {
  const { data } = useGetGenerationStatsQuery();

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {STAT_ITEMS.map((item) => (
        <div key={item.key} className="rounded-2xl border bg-card px-4 py-3">
          <p className="text-[11.5px] text-ink-3">
            {item.label} · last {data?.hours ?? 24}h
          </p>
          <p
            className={cn(
              'mt-1 font-serif text-[22px] leading-none font-semibold',
              item.className,
            )}
          >
            {data ? formatCredits(data.counts[item.key]) : '—'}
          </p>
        </div>
      ))}
    </div>
  );
}

export function GenerationsView() {
  const [status, setStatus] = useState('all');
  const [type, setType] = useState('all');
  const [query, setQuery] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState(null);
  const search = useDebouncedValue(query.trim());
  const statsQuery = useGetGenerationStatsQuery();
  const { data, isLoading, isFetching, error, refetch, fulfilledTimeStamp } =
    useListAdminGenerationsQuery({
      page,
      limit: PAGE_SIZE,
      search,
      status: status === 'all' ? undefined : status,
      capability: type === 'all' ? undefined : type,
      from: from || undefined,
      to: to || undefined,
    });
  const generations = data?.items ?? [];

  function changeFilter(setter) {
    return (value) => {
      setter(value);
      setPage(1);
    };
  }

  function handleRefresh() {
    refetch();
    statsQuery.refetch();
  }

  return (
    <div className="flex flex-col gap-4">
      <AdminPageHeader
        title="Audio generation monitoring"
        count={data ? `${data.meta.total} jobs` : null}
      >
        <SearchField
          value={query}
          onChange={changeFilter(setQuery)}
          placeholder="Search by user email..."
          className="sm:w-56"
        />
        <FilterSelect
          label="Filter by status"
          value={status}
          onChange={changeFilter(setStatus)}
          options={STATUS_OPTIONS}
        />
        <div className="flex items-center gap-2">
          {fulfilledTimeStamp ? (
            <span className="font-mono text-[11.5px] whitespace-nowrap text-ink-3">
              Updated {formatTimeOfDay(fulfilledTimeStamp)}
            </span>
          ) : null}
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isFetching}
          >
            {isFetching ? <Spinner /> : <RefreshCw />}
            Refresh
          </Button>
        </div>
      </AdminPageHeader>

      <StatsStrip />

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <ChoiceChips
          label="Filter by type"
          options={TYPE_OPTIONS}
          value={type}
          onChange={changeFilter(setType)}
        />
        <div className="flex flex-wrap items-center gap-2">
          <DateFilter
            id="generations-from"
            label="From"
            value={from}
            onChange={changeFilter(setFrom)}
          />
          <DateFilter
            id="generations-to"
            label="To"
            value={to}
            onChange={changeFilter(setTo)}
          />
          {from || to ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setFrom('');
                setTo('');
                setPage(1);
              }}
            >
              Clear dates
            </Button>
          ) : null}
        </div>
      </div>

      <AdminTable
        columns={COLUMNS}
        tableClassName="min-w-[900px]"
        className={isFetching && !isLoading ? 'opacity-70' : undefined}
        footer={
          <PaginationFooter
            pagination={serverPagination(data?.meta, setPage)}
          />
        }
      >
        <TableStateRows
          colSpan={COLUMNS.length}
          isLoading={isLoading}
          error={error}
          isEmpty={data && generations.length === 0}
          empty="No jobs match these filters."
        />
        {generations.map((job) => {
          const jobStatus =
            GENERATION_STATUSES[job.status] ?? GENERATION_STATUSES.processing;

          return (
            <TableRow
              key={job.id}
              onClick={() => setSelectedId(job.id)}
              className="cursor-pointer"
            >
              <AdminCell>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    setSelectedId(job.id);
                  }}
                  className="rounded font-mono text-[12px] text-foreground outline-none hover:underline focus-visible:ring-[3px] focus-visible:ring-ring/50"
                  aria-label={`Open details for job ${job.id}`}
                >
                  {job.id.slice(-8)}
                </button>
              </AdminCell>
              <AdminCell className="whitespace-nowrap">
                <p className="text-[13px]">{job.user?.name ?? '—'}</p>
                <p className="text-[11.5px] text-ink-3">{job.user?.email}</p>
              </AdminCell>
              <AdminCell>
                <Tag>{capabilityShortLabel(job.capability)}</Tag>
              </AdminCell>
              <AdminCell className="font-mono text-[12px] whitespace-nowrap text-muted-foreground">
                {job.providerModelId ?? '—'}
              </AdminCell>
              <AdminCell>
                <div className="flex items-center gap-1.5">
                  <StatusBadge tone={jobStatus.tone}>
                    {jobStatus.label}
                  </StatusBadge>
                  {job.creditsRefunded > 0 ? (
                    <StatusBadge tone="neutral" dot={false}>
                      Refunded
                    </StatusBadge>
                  ) : null}
                </div>
              </AdminCell>
              <AdminCell className="font-mono text-[12.5px]">
                {job.status === 'processing'
                  ? `${formatCredits(job.creditsHeld)} held`
                  : formatCredits(job.creditsCharged)}
              </AdminCell>
              <AdminCell className="font-mono text-[12px] whitespace-nowrap text-ink-3">
                {formatDateTime(job.createdAt)}
              </AdminCell>
            </TableRow>
          );
        })}
      </AdminTable>

      <JobDetailsSheet
        jobId={selectedId}
        onOpenChange={(open) => {
          if (!open) setSelectedId(null);
        }}
      />
    </div>
  );
}
