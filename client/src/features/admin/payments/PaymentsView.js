'use client';

import { useState } from 'react';
import { CircleDollarSign, CircleX, CreditCard, Undo2 } from 'lucide-react';
import { toast } from 'sonner';
import { Spinner } from '@/components/ui/Spinner';
import { StatCard } from '@/components/ui/StatCard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/button';
import { TableRow } from '@/components/ui/table';
import { ConfirmDialog } from '@/features/admin/shared/ConfirmDialog';
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
import { NoticeAlert } from '@/features/admin/shared/NoticeAlert';
import { formatUsd, simulateWork } from '@/features/admin/shared/adminFormat';
import { formatDate } from '@/lib/format';
import {
  ADMIN_PAYMENTS,
  PAYMENT_STATS,
  PAYMENT_STATUSES,
} from '@/mocks/adminPayments';

const COLUMNS = [
  'Invoice',
  'User',
  'Package / plan',
  'Amount',
  'Method',
  'Status',
  'Date',
  { key: 'actions', label: 'Actions', srOnly: true },
];

const STATUS_OPTIONS = [
  { value: 'all', label: 'All statuses' },
  ...Object.entries(PAYMENT_STATUSES).map(([value, status]) => ({
    value,
    label: status.label,
  })),
];

export function PaymentsView() {
  const [payments, setPayments] = useState(ADMIN_PAYMENTS);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const [confirmId, setConfirmId] = useState(null);
  const [refundingId, setRefundingId] = useState(null);
  const [refundTotals, setRefundTotals] = useState({ count: 0, amount: 0 });

  const term = query.trim().toLowerCase();
  const filtered = payments.filter(
    (payment) =>
      (status === 'all' || payment.status === status) &&
      `${payment.invoice} ${payment.userName} ${payment.item}`
        .toLowerCase()
        .includes(term),
  );
  const pagination = usePagination(filtered, 8);
  const confirmPayment = payments.find((payment) => payment.id === confirmId);

  function changeFilter(setter) {
    return (value) => {
      setter(value);
      pagination.setPage(1);
    };
  }

  function handleRefund() {
    const payment = confirmPayment;
    setConfirmId(null);
    setRefundingId(payment.id);
    simulateWork(() => {
      setPayments((current) =>
        current.map((item) =>
          item.id === payment.id ? { ...item, status: 'refunded' } : item,
        ),
      );
      setRefundTotals((current) => ({
        count: current.count + 1,
        amount: current.amount + payment.amount,
      }));
      setRefundingId(null);
      toast.success(
        `${formatUsd(payment.amount)} refunded to ${payment.userName}`,
      );
    }, 1300);
  }

  return (
    <div className="flex flex-col gap-4">
      <AdminPageHeader title="Payments" count={`${filtered.length} invoices`}>
        <SearchField
          value={query}
          onChange={changeFilter(setQuery)}
          placeholder="Search invoices..."
        />
        <FilterSelect
          label="Filter by status"
          value={status}
          onChange={changeFilter(setStatus)}
          options={STATUS_OPTIONS}
        />
      </AdminPageHeader>

      <NoticeAlert tone="warning">
        Payment provider not connected yet — showing demo data.
      </NoticeAlert>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Revenue (MTD)"
          value={formatUsd(PAYMENT_STATS.revenueMtd - refundTotals.amount, 0)}
          icon={CircleDollarSign}
          trend="+11% MoM"
        />
        <StatCard
          label="Successful payments"
          value={PAYMENT_STATS.successful.toLocaleString('en-US')}
          icon={CreditCard}
          note="This month"
        />
        <StatCard
          label="Refunds"
          value={(PAYMENT_STATS.refunds + refundTotals.count).toLocaleString(
            'en-US',
          )}
          icon={Undo2}
          note="1.1% of payments"
        />
        <StatCard
          label="Failed"
          value={PAYMENT_STATS.failed.toLocaleString('en-US')}
          icon={CircleX}
          note="Mostly card declines"
        />
      </div>

      <AdminTable
        columns={COLUMNS}
        tableClassName="min-w-[900px]"
        footer={<PaginationFooter pagination={pagination} />}
      >
        {pagination.pageItems.length ? (
          pagination.pageItems.map((payment) => {
            const paymentStatus = PAYMENT_STATUSES[payment.status];

            return (
              <TableRow key={payment.id}>
                <AdminCell className="font-mono text-[12px] whitespace-nowrap">
                  {payment.invoice}
                </AdminCell>
                <AdminCell className="whitespace-nowrap">
                  {payment.userName}
                </AdminCell>
                <AdminCell className="whitespace-nowrap text-muted-foreground">
                  {payment.item}
                </AdminCell>
                <AdminCell className="font-mono text-[12.5px]">
                  {formatUsd(payment.amount)}
                </AdminCell>
                <AdminCell className="font-mono text-[12px] whitespace-nowrap text-muted-foreground">
                  {payment.method}
                </AdminCell>
                <AdminCell>
                  <StatusBadge tone={paymentStatus.tone}>
                    {paymentStatus.label}
                  </StatusBadge>
                </AdminCell>
                <AdminCell className="whitespace-nowrap text-ink-3">
                  {formatDate(payment.date)}
                </AdminCell>
                <AdminCell className="text-right">
                  {payment.status === 'paid' ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={refundingId === payment.id}
                      onClick={() => setConfirmId(payment.id)}
                      aria-label={`Refund ${payment.invoice}`}
                    >
                      {refundingId === payment.id ? <Spinner /> : null}
                      Refund
                    </Button>
                  ) : null}
                </AdminCell>
              </TableRow>
            );
          })
        ) : (
          <EmptyTableRow colSpan={COLUMNS.length}>
            No payments match these filters.
          </EmptyTableRow>
        )}
      </AdminTable>

      <ConfirmDialog
        open={Boolean(confirmPayment)}
        onOpenChange={(open) => {
          if (!open) setConfirmId(null);
        }}
        title={`Refund ${confirmPayment ? formatUsd(confirmPayment.amount) : ''}?`}
        description={
          confirmPayment
            ? `${confirmPayment.invoice} for ${confirmPayment.userName} will be refunded to ${confirmPayment.method}. Unused credits from this purchase are removed.`
            : ''
        }
        confirmLabel="Refund payment"
        onConfirm={handleRefund}
      />
    </div>
  );
}
