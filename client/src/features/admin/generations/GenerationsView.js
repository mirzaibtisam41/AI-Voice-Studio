'use client';

import { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { ChoiceChips } from '@/components/ui/ChoiceChips';
import { Spinner } from '@/components/ui/Spinner';
import { StatusBadge, Tag } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/button';
import { TableRow } from '@/components/ui/table';
import { JobDetailsSheet } from '@/features/admin/generations/JobDetailsSheet';
import {
  AdminCell,
  AdminTable,
  EmptyTableRow,
  PaginationFooter,
  usePagination,
} from '@/features/admin/shared/AdminTable';
import {
  AdminPageHeader,
  FilterSelect,
  SearchField,
} from '@/features/admin/shared/AdminToolbar';
import {
  formatCredits,
  simulateWork,
} from '@/features/admin/shared/adminFormat';
import { formatDateTime, formatDuration } from '@/lib/format';
import { ADMIN_JOBS, JOB_STATUSES, JOB_TYPES } from '@/mocks/adminJobs';

const STATUS_OPTIONS = [
  { value: 'all', label: 'All statuses' },
  ...Object.entries(JOB_STATUSES).map(([value, status]) => ({
    value,
    label: status.label,
  })),
];

const TYPE_OPTIONS = [
  { value: 'all', label: 'All' },
  ...JOB_TYPES.map((type) => ({ value: type, label: type })),
];

const COLUMNS = [
  'Job',
  'User',
  'Type',
  'Model',
  'Status',
  'Credits',
  'Duration',
  'Started',
];

function advanceJobs(jobs) {
  return jobs.map((job) => {
    if (job.status === 'processing') {
      return {
        ...job,
        status: 'completed',
        credits: job.creditsHeld || 3,
        durationSec: 48,
      };
    }
    if (job.status === 'queued') return { ...job, status: 'processing' };

    return job;
  });
}

function formatClock(date) {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
  });
}

export function GenerationsView() {
  const [jobs, setJobs] = useState(ADMIN_JOBS);
  const [status, setStatus] = useState('all');
  const [type, setType] = useState('all');
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [updatedAt, setUpdatedAt] = useState('9:42:10 AM');

  const term = query.trim().toLowerCase();
  const filtered = jobs.filter(
    (job) =>
      (status === 'all' || job.status === status) &&
      (type === 'all' || job.type === type) &&
      `${job.userName} ${job.id}`.toLowerCase().includes(term),
  );
  const pagination = usePagination(filtered, 10);
  const selectedJob = jobs.find((job) => job.id === selectedId) ?? null;

  function changeFilter(setter) {
    return (value) => {
      setter(value);
      pagination.setPage(1);
    };
  }

  function handleRefresh() {
    setRefreshing(true);
    simulateWork(() => {
      setJobs(advanceJobs);
      setUpdatedAt(formatClock(new Date()));
      setRefreshing(false);
      toast.success('Job list refreshed');
    }, 800);
  }

  function handleRefund(job) {
    setJobs((current) =>
      current.map((item) =>
        item.id === job.id ? { ...item, refunded: true } : item,
      ),
    );
    toast.success(
      `${formatCredits(job.creditsHeld)} credits refunded to ${job.userName}`,
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <AdminPageHeader
        title="Audio generation monitoring"
        count={`${filtered.length} jobs`}
      >
        <SearchField
          value={query}
          onChange={changeFilter(setQuery)}
          placeholder="Search by user..."
          className="sm:w-52"
        />
        <FilterSelect
          label="Filter by status"
          value={status}
          onChange={changeFilter(setStatus)}
          options={STATUS_OPTIONS}
        />
        <div className="flex items-center gap-2">
          <span className="font-mono text-[11.5px] whitespace-nowrap text-ink-3">
            Updated {updatedAt}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            {refreshing ? <Spinner /> : <RefreshCw />}
            Refresh
          </Button>
        </div>
      </AdminPageHeader>

      <ChoiceChips
        label="Filter by type"
        options={TYPE_OPTIONS}
        value={type}
        onChange={changeFilter(setType)}
      />

      <AdminTable
        columns={COLUMNS}
        tableClassName="min-w-[900px]"
        footer={<PaginationFooter pagination={pagination} />}
      >
        {pagination.pageItems.length ? (
          pagination.pageItems.map((job) => {
            const jobStatus = JOB_STATUSES[job.status];

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
                    aria-label={`Open details for ${job.id}`}
                  >
                    {job.id}
                  </button>
                </AdminCell>
                <AdminCell className="whitespace-nowrap">
                  {job.userName}
                </AdminCell>
                <AdminCell>
                  <Tag>{job.type}</Tag>
                </AdminCell>
                <AdminCell className="font-mono text-[12px] whitespace-nowrap text-muted-foreground">
                  {job.model}
                </AdminCell>
                <AdminCell>
                  <div className="flex items-center gap-1.5">
                    <StatusBadge tone={jobStatus.tone}>
                      {jobStatus.label}
                    </StatusBadge>
                    {job.refunded ? (
                      <StatusBadge tone="neutral" dot={false}>
                        Refunded
                      </StatusBadge>
                    ) : null}
                  </div>
                </AdminCell>
                <AdminCell className="font-mono text-[12.5px]">
                  {job.credits ? formatCredits(job.credits) : '—'}
                </AdminCell>
                <AdminCell className="font-mono text-[12.5px] text-muted-foreground">
                  {job.durationSec ? formatDuration(job.durationSec) : '—'}
                </AdminCell>
                <AdminCell className="font-mono text-[12px] whitespace-nowrap text-ink-3">
                  {formatDateTime(job.startedAt)}
                </AdminCell>
              </TableRow>
            );
          })
        ) : (
          <EmptyTableRow colSpan={COLUMNS.length}>
            No jobs match these filters.
          </EmptyTableRow>
        )}
      </AdminTable>

      <JobDetailsSheet
        job={selectedJob}
        onOpenChange={(open) => {
          if (!open) setSelectedId(null);
        }}
        onRefund={handleRefund}
      />
    </div>
  );
}
