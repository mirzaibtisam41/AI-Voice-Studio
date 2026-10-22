'use client';

import { Fragment, useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TableCell, TableRow } from '@/components/ui/table';
import { useListAuditLogsQuery } from '@/features/admin/adminApi';
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
import { formatLogTime } from '@/features/admin/shared/adminFormat';
import { useDebouncedValue } from '@/features/admin/shared/useDebouncedValue';
import { cn } from '@/lib/utils';

const PAGE_SIZE = 15;

const COLUMNS = [
  { key: 'expand', label: 'Expand', srOnly: true, className: 'w-8' },
  'Time',
  'Actor',
  'Action',
  'Target',
];

const ACTIONS = [
  'provider.created',
  'provider.updated',
  'provider.status_changed',
  'provider.deleted',
  'model.created',
  'model.updated',
  'model.status_changed',
  'model.capability_updated',
  'model.default_changed',
  'voice.updated',
  'settings.updated',
  'user.status_changed',
  'user.role_changed',
  'wallet.adjusted',
  'generation.refunded',
];

const ACTION_OPTIONS = [
  { value: 'all', label: 'All actions' },
  ...ACTIONS.map((action) => ({ value: action, label: action })),
];

export function AuditLogsView() {
  const [query, setQuery] = useState('');
  const [action, setAction] = useState('all');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [page, setPage] = useState(1);
  const [expandedId, setExpandedId] = useState(null);
  const search = useDebouncedValue(query.trim());
  const { data, isLoading, isFetching, error } = useListAuditLogsQuery({
    page,
    limit: PAGE_SIZE,
    search,
    action: action === 'all' ? undefined : action,
    from: from || undefined,
    to: to || undefined,
  });
  const logs = data?.items ?? [];

  function changeFilter(setter) {
    return (value) => {
      setter(value);
      setPage(1);
    };
  }

  function toggle(id) {
    setExpandedId((current) => (current === id ? null : id));
  }

  return (
    <div className="flex flex-col gap-4">
      <AdminPageHeader
        title="Audit logs"
        count={data ? `${data.meta.total} events` : null}
      >
        <SearchField
          value={query}
          onChange={changeFilter(setQuery)}
          placeholder="Search actor, action, target..."
          className="sm:w-64"
        />
        <FilterSelect
          label="Filter by action"
          value={action}
          onChange={changeFilter(setAction)}
          options={ACTION_OPTIONS}
          className="sm:w-56"
        />
      </AdminPageHeader>

      <div className="flex flex-wrap items-center gap-2">
        <DateFilter
          id="audit-from"
          label="From"
          value={from}
          onChange={changeFilter(setFrom)}
        />
        <DateFilter
          id="audit-to"
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

      <AdminTable
        columns={COLUMNS}
        tableClassName="min-w-[760px]"
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
          isEmpty={data && logs.length === 0}
          empty="No log entries match these filters."
        />
        {logs.map((log) => {
          const expanded = expandedId === log.id;
          const system = !log.actorId;

          return (
            <Fragment key={log.id}>
              <TableRow
                onClick={() => toggle(log.id)}
                className={cn('cursor-pointer', expanded && 'border-b-0')}
              >
                <AdminCell className="w-8 pr-0">
                  <button
                    type="button"
                    aria-expanded={expanded}
                    aria-controls={`${log.id}-details`}
                    aria-label={`${expanded ? 'Hide' : 'Show'} details for ${log.action}`}
                    onClick={(event) => {
                      event.stopPropagation();
                      toggle(log.id);
                    }}
                    className="flex size-6 items-center justify-center rounded-md text-ink-3 outline-none hover:bg-accent hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50"
                  >
                    <ChevronRight
                      className={cn(
                        'size-4 transition-transform',
                        expanded && 'rotate-90',
                      )}
                      aria-hidden="true"
                    />
                  </button>
                </AdminCell>
                <AdminCell className="font-mono text-[12px] whitespace-nowrap text-ink-3">
                  {formatLogTime(log.createdAt)}
                </AdminCell>
                <AdminCell
                  className={cn(
                    'text-[12.5px] whitespace-nowrap',
                    system ? 'font-mono text-ink-3' : 'text-muted-foreground',
                  )}
                >
                  {log.actorEmail}
                </AdminCell>
                <AdminCell className="font-mono text-[12px] whitespace-nowrap">
                  {log.action}
                </AdminCell>
                <AdminCell className="text-[13px]">
                  <span className="text-ink-3">{log.targetType}</span>
                  {log.targetLabel ? ` · ${log.targetLabel}` : null}
                </AdminCell>
              </TableRow>
              {expanded ? (
                <TableRow
                  id={`${log.id}-details`}
                  className="hover:bg-transparent"
                >
                  <TableCell colSpan={COLUMNS.length} className="px-4 pt-0">
                    <pre className="overflow-x-auto rounded-xl border bg-field/70 p-3.5 font-mono text-[12px] leading-relaxed text-muted-foreground">
                      {JSON.stringify(
                        {
                          id: log.id,
                          actor: log.actorEmail,
                          targetType: log.targetType,
                          targetId: log.targetId,
                          details: log.details,
                        },
                        null,
                        2,
                      )}
                    </pre>
                  </TableCell>
                </TableRow>
              ) : null}
            </Fragment>
          );
        })}
      </AdminTable>
    </div>
  );
}
