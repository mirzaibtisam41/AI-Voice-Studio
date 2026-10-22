'use client';

import { Fragment, useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { TableCell, TableRow } from '@/components/ui/table';
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
import { cn } from '@/lib/utils';
import { AUDIT_ACTORS, AUDIT_LOGS } from '@/mocks/adminAuditLogs';

const COLUMNS = [
  { key: 'expand', label: 'Expand', srOnly: true, className: 'w-8' },
  'Time',
  'Actor',
  'Action',
  'Target',
];

const ACTOR_OPTIONS = [
  { value: 'all', label: 'All actors' },
  ...AUDIT_ACTORS.map((actor) => ({ value: actor, label: actor })),
];

export function AuditLogsView() {
  const [query, setQuery] = useState('');
  const [actor, setActor] = useState('all');
  const [expandedId, setExpandedId] = useState(null);
  const term = query.trim().toLowerCase();
  const filtered = AUDIT_LOGS.filter(
    (log) =>
      (actor === 'all' || log.actor === actor) &&
      `${log.time} ${log.actor} ${log.action} ${log.target}`
        .toLowerCase()
        .includes(term),
  );
  const pagination = usePagination(filtered, 10);

  function changeFilter(setter) {
    return (value) => {
      setter(value);
      pagination.setPage(1);
    };
  }

  function toggle(id) {
    setExpandedId((current) => (current === id ? null : id));
  }

  return (
    <div className="flex flex-col gap-4">
      <AdminPageHeader title="Audit logs" count={`${filtered.length} events`}>
        <SearchField
          value={query}
          onChange={changeFilter(setQuery)}
          placeholder="Filter logs..."
        />
        <FilterSelect
          label="Filter by actor"
          value={actor}
          onChange={changeFilter(setActor)}
          options={ACTOR_OPTIONS}
          className="sm:w-56"
        />
      </AdminPageHeader>

      <AdminTable
        columns={COLUMNS}
        tableClassName="min-w-[760px]"
        footer={<PaginationFooter pagination={pagination} />}
      >
        {pagination.pageItems.length ? (
          pagination.pageItems.map((log) => {
            const expanded = expandedId === log.id;

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
                    {log.time}
                  </AdminCell>
                  <AdminCell
                    className={cn(
                      'text-[12.5px] whitespace-nowrap',
                      log.actor === 'system'
                        ? 'font-mono text-ink-3'
                        : 'text-muted-foreground',
                    )}
                  >
                    {log.actor}
                  </AdminCell>
                  <AdminCell className="font-mono text-[12px] whitespace-nowrap">
                    {log.action}
                  </AdminCell>
                  <AdminCell className="text-[13px]">{log.target}</AdminCell>
                </TableRow>
                {expanded ? (
                  <TableRow
                    id={`${log.id}-details`}
                    className="hover:bg-transparent"
                  >
                    <TableCell colSpan={COLUMNS.length} className="px-4 pt-0">
                      <pre className="overflow-x-auto rounded-xl border bg-field/70 p-3.5 font-mono text-[12px] leading-relaxed text-muted-foreground">
                        {JSON.stringify(
                          { id: log.id, actor: log.actor, ...log.details },
                          null,
                          2,
                        )}
                      </pre>
                    </TableCell>
                  </TableRow>
                ) : null}
              </Fragment>
            );
          })
        ) : (
          <EmptyTableRow colSpan={COLUMNS.length}>
            No log entries match these filters.
          </EmptyTableRow>
        )}
      </AdminTable>
    </div>
  );
}
