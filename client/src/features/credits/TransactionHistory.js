'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, Download, ReceiptText } from 'lucide-react';
import { toast } from 'sonner';
import { Chip } from '@/components/ui/ChoiceChips';
import { EmptyState } from '@/components/ui/EmptyState';
import { FormAlert } from '@/components/ui/FormAlert';
import { Panel } from '@/components/ui/Panel';
import { Spinner } from '@/components/ui/Spinner';
import { Tag } from '@/components/ui/StatusBadge';
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
import { transactionFeature } from '@/features/credits/capabilities';
import { useListWalletTransactionsQuery } from '@/features/credits/creditsApi';
import { useTransactionsExport } from '@/features/credits/useTransactionsExport';
import { getErrorMessage } from '@/lib/apiError';
import { formatDateTime } from '@/lib/format';
import { cn } from '@/lib/utils';

const PAGE_SIZE = 10;

const TRANSACTION_FILTERS = [
  { value: '', label: 'All' },
  { value: 'usage', label: 'Usage' },
  { value: 'refunds', label: 'Refunds' },
  { value: 'credits', label: 'Credits added' },
  { value: 'debits', label: 'Debits' },
];

function formatCredits(value) {
  return `${value > 0 ? '+' : '−'}${Math.abs(value).toLocaleString()}`;
}

export function TransactionHistory() {
  const [type, setType] = useState('');
  const [page, setPage] = useState(1);
  const { data, isLoading, isFetching, error } = useListWalletTransactionsQuery(
    { page, limit: PAGE_SIZE, type },
  );
  const { exportCsv, isExporting } = useTransactionsExport();
  const transactions = data?.transactions ?? [];
  const totalPages = data?.meta.totalPages ?? 0;

  const changeType = (value) => {
    setType(value);
    setPage(1);
  };

  const handleExport = async () => {
    try {
      await exportCsv({ type });
      toast.success('Export downloaded');
    } catch (exportError) {
      toast.error(exportError.message);
    }
  };

  return (
    <Panel
      title="Transaction history"
      action={
        <Button
          variant="outline"
          size="sm"
          className="shrink-0"
          onClick={handleExport}
          disabled={isExporting}
        >
          {isExporting ? <Spinner /> : <Download />}
          Export CSV
        </Button>
      }
    >
      <div
        role="group"
        aria-label="Filter transactions"
        className="flex flex-wrap gap-2"
      >
        {TRANSACTION_FILTERS.map((option) => (
          <Chip
            key={option.value || 'all'}
            selected={type === option.value}
            onClick={() => changeType(option.value)}
          >
            {option.label}
          </Chip>
        ))}
      </div>

      {error ? <FormAlert>{getErrorMessage(error)}</FormAlert> : null}

      {isLoading ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton key={index} className="h-10 w-full" />
          ))}
        </div>
      ) : transactions.length > 0 ? (
        <Table
          className={cn('min-w-170', isFetching && 'opacity-60')}
          aria-busy={isFetching}
        >
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Date</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Feature</TableHead>
              <TableHead className="text-right">Credits</TableHead>
              <TableHead className="text-right">Balance after</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell className="font-mono text-[12px] whitespace-nowrap text-muted-foreground">
                  {formatDateTime(transaction.createdAt)}
                </TableCell>
                <TableCell className="font-medium">
                  {transaction.reason || transactionFeature(transaction)}
                </TableCell>
                <TableCell>
                  <Tag className="whitespace-nowrap">
                    {transactionFeature(transaction)}
                  </Tag>
                </TableCell>
                <TableCell
                  className={cn(
                    'text-right font-mono whitespace-nowrap',
                    transaction.amount > 0 ? 'text-success' : 'text-danger',
                  )}
                >
                  {formatCredits(transaction.amount)}
                </TableCell>
                <TableCell className="text-right font-mono whitespace-nowrap text-muted-foreground">
                  {transaction.balanceAfter.toLocaleString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : error ? null : (
        <EmptyState
          icon={ReceiptText}
          title="No transactions yet"
          description="Transactions of this type will show up here."
        />
      )}

      {totalPages > 1 ? (
        <div className="flex items-center justify-between gap-3">
          <p className="font-mono text-[12px] text-ink-3" aria-live="polite">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((current) => current - 1)}
              disabled={page <= 1 || isFetching}
            >
              <ChevronLeft />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((current) => current + 1)}
              disabled={page >= totalPages || isFetching}
            >
              Next
              <ChevronRight />
            </Button>
          </div>
        </div>
      ) : null}
    </Panel>
  );
}
