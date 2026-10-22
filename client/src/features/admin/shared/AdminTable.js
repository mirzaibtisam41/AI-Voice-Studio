'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { getErrorMessage } from '@/lib/apiError';
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

export function LoadingTableRows({ colSpan, rows = 5 }) {
  return Array.from({ length: rows }, (_, index) => (
    <TableRow key={index} className="hover:bg-transparent">
      <TableCell colSpan={colSpan} className="px-4 py-3">
        <Skeleton className="h-6 w-full" />
      </TableCell>
    </TableRow>
  ));
}

export function TableStateRows({ colSpan, isLoading, error, isEmpty, empty }) {
  if (isLoading) return <LoadingTableRows colSpan={colSpan} />;
  if (error) {
    return (
      <EmptyTableRow colSpan={colSpan}>
        <span className="text-danger">{getErrorMessage(error)}</span>
      </EmptyTableRow>
    );
  }
  if (isEmpty) return <EmptyTableRow colSpan={colSpan}>{empty}</EmptyTableRow>;

  return null;
}

export function serverPagination(meta, setPage) {
  const page = meta?.page ?? 1;
  const limit = meta?.limit ?? 0;
  const total = meta?.total ?? 0;

  return {
    page,
    pageCount: Math.max(1, meta?.totalPages ?? 1),
    setPage,
    start: total ? (page - 1) * limit + 1 : 0,
    end: Math.min(page * limit, total),
    total,
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
