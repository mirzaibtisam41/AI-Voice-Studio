'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';

export function AdminTable({
  columns,
  footer,
  className,
  tableClassName = 'min-w-[680px]',
  children,
}) {
  return (
    <div
      className={cn(
        'min-w-0 overflow-hidden rounded-2xl border bg-card',
        className,
      )}
    >
      <Table className={tableClassName}>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            {columns.map((column) => {
              const label = column.label ?? column;

              return (
                <TableHead
                  key={column.key ?? label}
                  className={cn(
                    'text-[10.5px] tracking-wide first:pl-4 last:pr-4',
                    column.className,
                  )}
                >
                  {column.srOnly ? (
                    <span className="sr-only">{label}</span>
                  ) : (
                    label
                  )}
                </TableHead>
              );
            })}
          </TableRow>
        </TableHeader>
        <TableBody>{children}</TableBody>
      </Table>
      {footer}
    </div>
  );
}

export function AdminCell({ className, ...props }) {
  return (
    <TableCell className={cn('first:pl-4 last:pr-4', className)} {...props} />
  );
}

export function EmptyTableRow({ colSpan, children }) {
  return (
    <TableRow className="hover:bg-transparent">
      <TableCell
        colSpan={colSpan}
        className="py-10 text-center text-[13px] text-ink-3"
      >
        {children}
      </TableCell>
    </TableRow>
  );
}

export function usePagination(items, pageSize = 8) {
  const [page, setPage] = useState(1);
  const pageCount = Math.max(1, Math.ceil(items.length / pageSize));
  const current = Math.min(page, pageCount);
  const offset = (current - 1) * pageSize;

  return {
    page: current,
    pageCount,
    setPage,
    pageItems: items.slice(offset, offset + pageSize),
    start: items.length ? offset + 1 : 0,
    end: Math.min(offset + pageSize, items.length),
    total: items.length,
  };
}

export function PaginationFooter({ pagination }) {
  const { page, pageCount, setPage, start, end, total } = pagination;

  return (
    <div className="flex items-center justify-between gap-3 border-t px-4 py-3">
      <p className="text-[12px] text-ink-3">
        Showing{' '}
        <span className="font-mono text-muted-foreground">
          {start}–{end}
        </span>{' '}
        of <span className="font-mono text-muted-foreground">{total}</span>
      </p>
      <div className="flex items-center gap-1.5">
        <Button
          variant="outline"
          size="icon-sm"
          aria-label="Previous page"
          disabled={page <= 1}
          onClick={() => setPage(page - 1)}
        >
          <ChevronLeft />
        </Button>
        <Button
          variant="outline"
          size="icon-sm"
          aria-label="Next page"
          disabled={page >= pageCount}
          onClick={() => setPage(page + 1)}
        >
          <ChevronRight />
        </Button>
      </div>
    </div>
  );
}
