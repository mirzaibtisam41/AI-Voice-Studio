'use client';

import { useState } from 'react';
import { useSelector } from 'react-redux';
import { Download, ReceiptText } from 'lucide-react';
import { toast } from 'sonner';
import { Chip } from '@/components/ui/ChoiceChips';
import { EmptyState } from '@/components/ui/EmptyState';
import { Panel } from '@/components/ui/Panel';
import { Tag } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatDateTime } from '@/lib/format';
import { cn } from '@/lib/utils';
import { selectTransactions } from '@/features/credits/walletSlice';
import { featureLabel } from '@/features/credits/walletUsage';

const TRANSACTION_FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'usage', label: 'Usage' },
  { value: 'credits', label: 'Credits added' },
];

function filterTransactions(transactions, filter) {
  if (filter === 'usage') {
    return transactions.filter((transaction) => transaction.amount < 0);
  }
  if (filter === 'credits') {
    return transactions.filter((transaction) => transaction.amount > 0);
  }

  return transactions;
}

function formatCredits(value) {
  return `${value > 0 ? '+' : '−'}${Math.abs(value).toLocaleString()}`;
}

function toCsv(transactions) {
  const header = ['Date', 'Description', 'Feature', 'Credits', 'Balance after'];
  const rows = transactions.map((transaction) => [
    transaction.createdAt,
    `"${transaction.description.replaceAll('"', '""')}"`,
    featureLabel(transaction.feature),
    transaction.amount,
    transaction.balanceAfter,
  ]);

  return [header, ...rows].map((row) => row.join(',')).join('\n');
}

function downloadCsv(transactions) {
  const blob = new Blob([toCsv(transactions)], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = 'ai-voice-studio-transactions.csv';
  link.click();
  URL.revokeObjectURL(url);
}

export function TransactionHistory() {
  const transactions = useSelector(selectTransactions);
  const [filter, setFilter] = useState('all');
  const visible = filterTransactions(transactions, filter);

  const handleExport = () => {
    downloadCsv(visible);
    toast.success('Export started');
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
        >
          <Download />
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
            key={option.value}
            selected={filter === option.value}
            onClick={() => setFilter(option.value)}
          >
            {option.label}
          </Chip>
        ))}
      </div>

      {visible.length > 0 ? (
        <Table className="min-w-[680px]">
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
            {visible.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell className="font-mono text-[12px] whitespace-nowrap text-muted-foreground">
                  {formatDateTime(transaction.createdAt)}
                </TableCell>
                <TableCell className="font-medium">
                  {transaction.description}
                </TableCell>
                <TableCell>
                  <Tag className="whitespace-nowrap">
                    {featureLabel(transaction.feature)}
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
      ) : (
        <EmptyState
          icon={ReceiptText}
          title="No transactions yet"
          description="Transactions of this type will show up here."
        />
      )}
    </Panel>
  );
}
